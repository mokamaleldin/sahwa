import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { compileUI } from "./helpers/compile-ui.js";
const output = "tmp/navigation-tests";
const at = compileUI(output, [
  "src/config/features.ts",
  "src/lib/sessionClient.ts",
  "src/auth/SessionContext.ts",
  "src/auth/useSession.ts",
  "src/auth/SessionProvider.tsx",
  "src/auth/RequireSession.tsx",
  "src/components/shared/Header.tsx",
  "src/components/shared/Footer.tsx",
  "src/components/shared/PageIdentity.tsx",
  "src/components/shared/SiteLayout.tsx",
  "src/components/Team/TeamNavigation.tsx",
  "src/components/Team/TeamLayout.tsx",
  "src/components/Studio/StudioWorkspace.tsx",
  "src/views/Team.tsx",
  "src/views/Studio.tsx",
]);
fs.mkdirSync(`${output}/src/lib`, { recursive: true });
fs.writeFileSync(
  `${output}/src/lib/navigation.js`,
  `import React from 'react';export const NavContext=React.createContext({path:'/team',navigate:()=>{}});export const useLocation=()=>({pathname:React.useContext(NavContext).path});export const useNavigate=()=>React.useContext(NavContext).navigate;export function Link({to,children,end,...props}){const go=useNavigate();return React.createElement('a',{...props,href:to,onClick:e=>{e.preventDefault();go(to);}},children);}export const NavLink=Link;export function Navigate({to}){const go=useNavigate();React.useEffect(()=>go(to),[go,to]);return null;}`,
);

test("Next.js shell preserves the open Studio across team navigation and updates role visibility", async () => {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM('<div id="root"></div>', {
    url: "https://sahwa.world",
    pretendToBeVisual: true,
  });
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    act: globalThis.IS_REACT_ACT_ENVIRONMENT,
  };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const React = await import("react"),
    { createRoot } = await import("react-dom/client"),
    { HelmetProvider } = await import("react-helmet-async");
  HelmetProvider.canUseDOM = false;
  const [
    { createSessionClient },
    { default: SessionProvider },
    { default: SiteLayout },
    { default: TeamLayout },
    { default: Team },
    { default: Studio },
    { NavContext },
  ] = await Promise.all([
    at("src/lib/sessionClient.js"),
    at("src/auth/SessionProvider.js"),
    at("src/components/shared/SiteLayout.js"),
    at("src/components/Team/TeamLayout.js"),
    at("src/views/Team.js"),
    at("src/views/Studio.js"),
    at("src/lib/navigation.js"),
  ]);
  let role = "volunteer",
    calls = 0;
  const client = createSessionClient(async () => {
    calls++;
    return Response.json({
      authenticated: true,
      user: {
        id: "one",
        fullName: "أحمد",
        university: "استنيا",
        email: "one@example.invalid",
        accessRole: role,
      },
    });
  });
  await client.refresh();
  const h = React.createElement,
    root = createRoot(document.getElementById("root"));
  let go;
  function App() {
    const [path, setPath] = React.useState("/team");
    go = setPath;
    return h(
      NavContext.Provider,
      { value: { path, navigate: setPath } },
      h(
        SiteLayout,
        null,
        path.startsWith("/login")
          ? h("main", null, "تسجيل الدخول")
          : path === "/studio"
            ? h(Studio)
            : h(TeamLayout, null, h(Team)),
      ),
    );
  }
  try {
    await React.act(async () =>
      root.render(
        h(HelmetProvider, null, h(SessionProvider, { client }, h(App))),
      ),
    );
    assert.equal(document.querySelectorAll('a[href="/team/events"]').length, 0);
    assert.equal(
      document.querySelectorAll('a[href="/team/volunteers"]').length,
      0,
    );
    assert.equal(
      document.querySelectorAll('a[href="/team/accounts"]').length,
      0,
    );
    assert.ok(document.querySelector('a[href="/team/files"]'));
    const header = document.querySelector("header");
    await React.act(async () => go("/studio"));
    const frame = document.querySelector("iframe");
    assert.ok(frame);
    assert.equal(frame.getAttribute("src"), "/api/studio?embed=1");
    await React.act(async () => go("/team"));
    assert.equal(document.querySelector("iframe"), frame);
    assert.equal(document.querySelector("header"), header);
    assert.equal(frame.closest("main").hidden, true);
    assert.equal(calls, 1);
    role = "admin";
    await React.act(async () => client.refresh({ force: true }));
    assert.ok(document.querySelector('a[href="/team/events"]'));
    assert.ok(document.querySelector('a[href="/team/volunteers"]'));
    assert.ok(document.querySelector('a[href="/team/accounts"]'));
    await React.act(async () => client.anonymous());
    assert.equal(document.querySelector("iframe"), null);
  } finally {
    await React.act(async () => root.unmount());
    dom.window.close();
    globalThis.window = previous.window;
    globalThis.document = previous.document;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previous.act;
  }
});
