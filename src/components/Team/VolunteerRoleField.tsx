import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown } from "lucide-react";
import {
  VOLUNTEER_ROLE_GROUPS,
  roleForTitle,
  roleSearchText,
  volunteerRolesById,
  type VolunteerRoleOption,
} from "../../../shared/volunteer-roles.js";

export default function VolunteerRoleField({
  value,
  onChange,
}: {
  value: string;
  onChange: (title: string) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const words = roleSearchText(query).split(" ").filter(Boolean);
  const groups = VOLUNTEER_ROLE_GROUPS.map((group) => ({
    title: group.title,
    roles: group.roles.filter((role) => {
      const searchable = roleSearchText([role.title, group.title, role.status, role.keywords].join(" "));
      return words.every((word) => searchable.includes(word));
    }),
  })).filter((group) => group.roles.length > 0);
  const custom = query.trim() && !roleForTitle(query)
    ? { id: "custom", title: query.trim() }
    : null;
  const options = groups.flatMap((group) => group.roles);
  if (custom) options.push(custom);
  const current = options[active];
  const selected = roleForTitle(value);
  const activeId = open && current ? `${id}-${current.id}` : undefined;

  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView?.({ block: "nearest" });
  }, [activeId]);

  function showAll() {
    setQuery("");
    setActive(-1);
    setOpen(true);
  }
  function choose(role: VolunteerRoleOption) {
    onChange(role.title);
    setOpen(false);
    setActive(-1);
  }
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const down = event.key === "ArrowDown";
      if (!open) {
        showAll();
        setActive(down ? 0 : volunteerRolesById.size - 1);
      } else if (down) {
        setActive(Math.min(active + 1, options.length - 1));
      } else {
        setActive(active < 0 ? options.length - 1 : Math.max(0, active - 1));
      }
    } else if (event.key === "Enter" && open) {
      event.preventDefault();
      if (current) choose(current);
      else setOpen(false);
    }
  }
  function renderOption(role: VolunteerRoleOption) {
    return (
      <div
        key={role.id}
        id={`${id}-${role.id}`}
        role="option"
        aria-selected={role.id === (selected?.id || (custom ? "custom" : undefined))}
        className={`team-role-option${current?.id === role.id ? " team-role-active" : ""}`}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => choose(role)}
      >
        <span>{role.id === "custom" ? `استخدام «${role.title}»` : role.title}</span>
        {role.status && <small>{role.status}</small>}
      </div>
    );
  }
  return (
    <div className="team-field team-field-full team-role-field" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
    }}>
      <label htmlFor={id}>الدور في صحوة <small>اختياري</small></label>
      <div className="team-role-input">
        <input
          ref={input}
          id={id}
          role="combobox"
          aria-controls={`${id}-list`}
          aria-expanded={open}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          autoComplete="off"
          maxLength={120}
          value={value}
          placeholder="اختر دورًا أو اكتب دورًا آخر"
          onFocus={showAll}
          onClick={() => { if (!open) showAll(); }}
          onChange={(event) => {
            onChange(event.target.value);
            setQuery(event.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          tabIndex={-1}
          className="team-role-toggle"
          aria-label={open ? "إغلاق قائمة الأدوار" : "عرض كل الأدوار"}
          aria-controls={`${id}-list`}
          aria-expanded={open}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (open) setOpen(false);
            else {
              input.current?.focus();
              showAll();
            }
          }}
        >
          <ChevronDown size={18} aria-hidden="true" />
        </button>
      </div>
      <div id={`${id}-list`} role="listbox" aria-label="الأدوار في صحوة" className="team-role-list" hidden={!open}>
        {open && groups.map((group) => (
          <div key={group.title} role="group" aria-label={group.title}>
            <p className="team-role-group" aria-hidden="true">{group.title}</p>
            {group.roles.map(renderOption)}
          </div>
        ))}
        {open && custom && renderOption(custom)}
      </div>
      {!open && selected?.status && <small>{selected.status}</small>}
    </div>
  );
}
