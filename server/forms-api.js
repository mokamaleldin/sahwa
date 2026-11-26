import { TeamError, UUID } from "./team-data.js";
import { json, readInput, errorResponse } from "./http.js";
import { requireActor, forbidden } from "./platform/session.js";
import { can, canAny, isGlobalAdmin } from "./platform/access.js";
import { roleById, roleTitle } from "../shared/platform-roles.js";

const FIELD_TYPES = ["short_text", "long_text", "select", "url"];
const STATUSES = { new: "جديد", reviewing: "قيد المراجعة", accepted: "مقبول", postponed: "مؤجل", rejected: "مرفوض", closed: "مغلق" };
const ROUTE_ROLES = [
  "internal-activities-lead",
  "central-activities-lead",
  "university-relations-lead",
  "central-relations-lead",
  "media-lead",
  "university-youth-lead",
  "university-women-lead",
  "women-sector-lead",
  "sahwa-lead",
];

function inboxScopeLabel(actor) {
  if (isGlobalAdmin(actor)) return "الطلبات الموجهة إلى نطاق صلاحياتك";
  const parts = actor.assignments
    .filter((a) => ROUTE_ROLES.includes(a.roleId) || a.roleId === "review-lead")
    .map((a) => {
      const title = roleTitle(a.roleId, a.sector);
      return a.university ? `${title} — ${a.university}` : title;
    });
  if (parts.length) return `صندوق: ${[...new Set(parts)].join(" · ")}`;
  return "الطلبات الموجهة إلى نطاق صلاحياتك";
}

// Where a submission goes is computed on the server from the submitter's
// own record and assignments; the browser never chooses the receiving person.
export function routeFor(form, actor, answers) {
  const routing = form.routing || {};
  let roleId;
  if (routing.by === "fixed") roleId = routing.role;
  else if (routing.by === "scope") roleId = answers[routing.field || "scope"] === "مركزي" ? routing.central : routing.university;
  const role = roleById(roleId);
  if (!role) throw new TeamError("هذا النموذج غير مهيأ للتوجيه بعد.", 409);
  const sector = role.sector === "required" ? actor.sector : role.sector === "youth" || role.sector === "women" ? role.sector : null;
  const university = role.scope === "university" ? actor.university || null : null;
  if (role.scope === "university" && !university) throw new TeamError("لا توجد جامعة مسجلة لك لتوجيه الطلب. اختر النطاق المركزي أو تواصل مع مسؤولك.");
  return { roleId: role.id, university, sector };
}

export function validateAnswers(form, input) {
  const answers = {};
  for (const field of form.fields) {
    const raw = input?.[field.id];
    const value = typeof raw === "string" ? raw.trim() : "";
    const max = field.type === "long_text" ? 3000 : 300;
    if (value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new TeamError(`راجع حقل ${field.label}.`);
    if (field.required && !value) throw new TeamError(`أكمل حقل ${field.label}.`);
    if (value && field.type === "select" && !(field.options || []).includes(value)) throw new TeamError(`اختر قيمة صحيحة في ${field.label}.`);
    if (value && field.type === "url") {
      let ok = false;
      try { ok = ["https:", "http:"].includes(new URL(value).protocol); } catch { ok = false; }
      if (!ok) throw new TeamError(`أدخل رابطًا صحيحًا في ${field.label}.`);
    }
    answers[field.id] = value;
  }
  return answers;
}

function formVisibleTo(form, actor) {
  const sectors = form.audience?.sectors;
  return !Array.isArray(sectors) || !actor.sector || sectors.includes(actor.sector);
}

// Reviewers: holders of the routed role in the routed scope. Confidential
// forms are only ever visible to the routed role, never to platform admins.
function mayReview(actor, submission) {
  if (submission.form?.confidential || !ROUTE_ROLES.includes(submission.routeRole)) return false;
  return can(actor, "forms.review", { university: submission.routeUniversity || "*central*", sector: submission.routeSector, team: roleById(submission.routeRole)?.team || null });
}

function validateDefinition(input) {
  const title = typeof input.title === "string" ? input.title.trim().slice(0, 120) : "";
  if (!title) throw new TeamError("أدخل عنوان النموذج.");
  const description = typeof input.description === "string" ? input.description.trim().slice(0, 600) : "";
  if (!Array.isArray(input.fields) || !input.fields.length || input.fields.length > 20) throw new TeamError("أضف حقلًا واحدًا على الأقل (20 حقلًا كحد أقصى).");
  const ids = new Set();
  const fields = input.fields.map((field, index) => {
    const label = typeof field?.label === "string" ? field.label.trim().slice(0, 120) : "";
    if (!label) throw new TeamError(`أدخل اسم الحقل رقم ${index + 1}.`);
    if (!FIELD_TYPES.includes(field.type)) throw new TeamError(`نوع الحقل «${label}» غير مدعوم.`);
    let id = typeof field.id === "string" && /^[a-z][a-z0-9_]{0,30}$/.test(field.id) ? field.id : `f${index + 1}`;
    while (ids.has(id)) id = `${id}_`;
    ids.add(id);
    const options = field.type === "select" ? (Array.isArray(field.options) ? field.options : []).map((o) => String(o).trim().slice(0, 80)).filter(Boolean).slice(0, 20) : undefined;
    if (field.type === "select" && !options.length) throw new TeamError(`أضف خيارات للحقل «${label}».`);
    return { id, label, type: field.type, required: field.required === true, ...(options ? { options } : {}) };
  });
  const sectors = Array.isArray(input.audience?.sectors) ? input.audience.sectors.filter((s) => s === "youth" || s === "women") : ["youth", "women"];
  if (!sectors.length) throw new TeamError("حدد فئة واحدة على الأقل تستطيع استخدام النموذج.");
  return { title, description, fields, audience: { sectors }, active: input.active === true, sortOrder: Number.isSafeInteger(input.sortOrder) ? input.sortOrder : 100 };
}

function validateRouting(input, fields) {
  if (input?.by === "fixed" && ROUTE_ROLES.includes(input.role)) return { by: "fixed", role: input.role };
  if (input?.by === "scope" && ROUTE_ROLES.includes(input.university) && ROUTE_ROLES.includes(input.central)) {
    const scopeField = fields.find((f) => f.id === "scope" && f.type === "select");
    if (!scopeField || !["جامعي", "مركزي"].every((o) => scopeField.options.includes(o))) throw new TeamError("التوجيه بحسب النطاق يحتاج حقل اختيار باسم scope وخياري «جامعي» و«مركزي».");
    return { by: "scope", university: input.university, central: input.central };
  }
  throw new TeamError("اختر جهة استقبال من القائمة المعتمدة.");
}

export function createFormsHandler(teamStore, platformStore) {
  const stores = { teamStore, platformStore };
  return async (request) => {
    try {
      const actor = await requireActor(request, stores);
      const url = new URL(request.url);
      const view = url.searchParams.get("view") || "mine";
      if (request.method === "GET") {
        const forms = await platformStore.forms();
        if (view === "manage") {
          if (!canAny(actor, "forms.manage")) throw forbidden();
          return json({ forms, routeRoles: ROUTE_ROLES.map((id) => ({ id, title: roleTitle(id) })) });
        }
        if (view === "inbox") {
          if (!canAny(actor, "forms.review")) throw forbidden();
          const submissions = (await platformStore.submissionsForRoles(actor.isTest, ROUTE_ROLES, actor.permissions)).filter((s) => mayReview(actor, s));
          return json({
            submissions: submissions.map((s) => ({ ...s, routeTitle: roleTitle(s.routeRole, s.routeSector), statusLabel: STATUSES[s.status] })),
            statuses: STATUSES,
            scopeLabel: inboxScopeLabel(actor),
          });
        }
        if (!canAny(actor, "forms.submit")) throw forbidden();
        const visibleForms = forms.filter((f) => f.active && !f.confidential && formVisibleTo(f, actor)).map(({ routing: _r, ...f }) => f);
        const pendingForms = forms.filter((f) => f.confidential || !f.active).map((f) => ({ id: f.id, title: f.title, description: f.description, confidential: f.confidential }));
        if (actor.kind !== "account") return json({ forms: visibleForms, pending: pendingForms, submissions: [], statuses: STATUSES });
        const mine = await platformStore.submissionsBy(actor.volunteerId);
        return json({
          forms: visibleForms,
          pending: pendingForms,
          submissions: mine.map((s) => ({ id: s.id, title: s.form?.title, status: s.status, statusLabel: STATUSES[s.status], response: s.response, respondedBy: s.respondedBy, routeTitle: roleTitle(s.routeRole, s.routeSector), createdAt: s.createdAt })),
          statuses: STATUSES,
        });
      }
      const input = await readInput(request, 32 * 1024);
      if (request.method === "DELETE") {
        if (input.target === "inbox") {
          if (typeof input.id !== "string" || !UUID.test(input.id)) throw new TeamError("اختر طلبًا صحيحًا.");
          const submission = await platformStore.submission(input.id);
          if (!submission || submission.isTest !== actor.isTest || !mayReview(actor, submission)) throw forbidden();
          await platformStore.archiveSubmissionFromInbox(submission.id, Number(input.revision));
          await platformStore.audit({ actor: actor.fullName, actorVolunteer: actor.volunteerId, action: "submission.delete", details: { title: submission.form?.title || "" }, isTest: actor.isTest });
          return json({ deleted: true });
        }
        if (input.target === "form") {
          if (!can(actor, "forms.manage")) throw forbidden();
          if (typeof input.id !== "string" || !UUID.test(input.id)) throw new TeamError("اختر نموذجًا صحيحًا.");
          const existing = await platformStore.form(input.id);
          if (!existing) throw new TeamError("النموذج غير موجود.", 404);
          if (existing.confidential || existing.slug === "relations-bank")
            throw new TeamError("لا يمكن حذف هذا النموذج الأساسي للنظام؛ يمكنك تعطيله بدلًا من حذفه.", 409, "SYSTEM_FORM_PROTECTED");
          await platformStore.archiveForm(existing.id, Number(input.revision), actor.fullName);
          await platformStore.audit({ actor: actor.fullName, actorVolunteer: actor.volunteerId, action: "form.delete", details: { title: existing.title }, isTest: actor.isTest });
          return json({ deleted: true });
        }
        if (actor.kind !== "account" || !can(actor,"forms.submit",{})) throw forbidden();
        if (typeof input.id !== "string" || !UUID.test(input.id)) throw new TeamError("اختر طلبًا صحيحًا.");
        await platformStore.hideOwnSubmission(input.id, actor.volunteerId, actor.isTest);
        return json({ hidden: true });
      }
      if (request.method === "POST") {
        if (actor.kind !== "account") throw forbidden("قدّم الطلبات من حسابك الشخصي.");
        if (!can(actor, "forms.submit", {})) throw forbidden();
        if (typeof input.formId !== "string" || !UUID.test(input.formId)) throw new TeamError("اختر نموذجًا.");
        const form = await platformStore.form(input.formId);
        // Disabled forms and the confidential complaints path are refused on the server.
        if (!form || !form.active) throw new TeamError("هذا النموذج غير مفعل حاليًا.", 409, "FORM_INACTIVE");
        if (form.confidential) throw new TeamError("مسار الشكاوى السري غير مفعل بعد. استخدم المسار المعتمد الحالي.", 409, "FORM_INACTIVE");
        if (!formVisibleTo(form, actor)) throw forbidden();
        const answers = validateAnswers(form, input.answers);
        const route = routeFor(form, actor, answers);
        const id = await platformStore.createSubmission({
          formId: form.id,
          form: { id: form.id, title: form.title, fields: form.fields, revision: form.revision, confidential: form.confidential },
          submitterId: actor.volunteerId,
          answers,
          routeRole: route.roleId,
          routeUniversity: route.university,
          routeSector: route.sector,
          isTest: actor.isTest,
        });
        return json({ id, routeTitle: roleTitle(route.roleId, route.sector) }, 201);
      }
      if (request.method === "PUT" && input.action === "respond") {
        const submission = await platformStore.submission(String(input.id || ""));
        if (!submission || submission.isTest !== actor.isTest || !mayReview(actor, submission)) throw forbidden();
        if (!Object.hasOwn(STATUSES, input.status)) throw new TeamError("اختر حالة صحيحة.");
        const response = typeof input.response === "string" ? input.response.trim().slice(0, 1000) : "";
        await platformStore.respond(submission.id, Number(input.revision), input.status, response, actor.fullName);
        return json({ saved: true });
      }
      if (request.method === "PUT" && input.action === "save-form") {
        if (!can(actor, "forms.manage")) throw forbidden();
        const definition = validateDefinition(input.form || {});
        const label = actor.fullName;
        if (input.id) {
          const existing = await platformStore.form(String(input.id));
          if (!existing) throw new TeamError("النموذج غير موجود.", 404);
          if (existing.confidential && definition.active) throw new TeamError("لا يُفعّل نموذج الشكاوى قبل اعتماد جهة استقبال مستقلة ومسار وصول آمن.", 409, "CONFIDENTIAL_LOCKED");
          const routing = existing.confidential ? existing.routing : validateRouting(input.form?.routing || existing.routing, definition.fields);
          await platformStore.updateForm(existing.id, Number(input.revision), { ...definition, routing }, label);
        } else {
          const slug = `form-${Date.now().toString(36)}`;
          await platformStore.createForm({ ...definition, slug, routing: validateRouting(input.form?.routing, definition.fields) }, label);
        }
        await platformStore.audit({ actor: label, actorVolunteer: actor.volunteerId, action: "form.save", details: { title: definition.title, active: definition.active }, isTest: actor.isTest });
        return json({ saved: true });
      }
      return json({ error: "طريقة طلب غير متاحة." }, 405);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
