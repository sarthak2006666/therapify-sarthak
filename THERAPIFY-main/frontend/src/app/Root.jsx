import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { Heart, Menu, X, Shield, CircleUserRound } from "lucide-react";import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";

function Nav() {
  
const [scrolled, setScrolled] = useState(false);
const [open, setOpen] = useState(false);
const [isAuthenticated, setIsAuthenticated] = useState(
  () => Boolean(localStorage.getItem("token"))
);

const location = useLocation();
const isHome = location.pathname === "/";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  
useEffect(() => {
  setIsAuthenticated(Boolean(localStorage.getItem("token")));
}, [location.pathname]);


  const navLinks = [
  { label: "Features", href: isHome ? "#features" : "/#features" },
  { label: "How it works", href: isHome ? "#how" : "/#how" },
  { label: "Stories", href: isHome ? "#stories" : "/#stories" }];
navLinks.push({ label: "Events", href: "/events" });


  return (/*#__PURE__*/
    _jsxs("nav", {
      className: `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || !isHome ? "bg-card/95 backdrop-blur-sm shadow-sm" : "bg-transparent"}`, children: [/*#__PURE__*/


      _jsxs("div", { className: "max-w-6xl mx-auto px-6 py-4 flex items-center justify-between", children: [/*#__PURE__*/
        _jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [/*#__PURE__*/
          _jsx("div", { className: "w-8 h-8 rounded-full bg-primary flex items-center justify-center", children: /*#__PURE__*/
            _jsx(Heart, { className: "w-4 h-4 text-primary-foreground" }) }
          ), /*#__PURE__*/
          _jsx("span", { className: "font-display text-xl font-semibold text-foreground", children: "Therapify" })] }
        ), /*#__PURE__*/

        _jsx("div", { className: "hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground", children:
          navLinks.map((l) => /*#__PURE__*/
          _jsx("a", { href: l.href, className: "hover:text-foreground transition-colors", children:
            l.label }, l.label
          )
          ) }
        ), /*#__PURE__*/

        
<div className="hidden md:flex items-center gap-3">
  {isAuthenticated ? (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-foreground" aria-label="Signed-in profile">
        <CircleUserRound className="w-7 h-7 text-primary" />
        <span className="text-sm font-medium">{(() => {
          try { return JSON.parse(localStorage.getItem("user") || "null")?.name || "My profile"; }
          catch { return "My profile"; }
        })()}</span>
      </div>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
          window.location.href = "/";
        }}
        className="text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors"
      >
        Log Out
      </button>
    </div>
  ) : (
    <>
      <Link to="/signin" className="text-sm font-medium text-foreground px-4 py-2">
        Sign in
      </Link>
      <Link to="/register" className="text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-full">
        Get started
      </Link>
    </>
  )}
</div>
, /*#__PURE__*/

        _jsx("button", { className: "md:hidden text-foreground p-2", onClick: () => setOpen(!open), children:
          open ? /*#__PURE__*/_jsx(X, { className: "w-5 h-5" }) : /*#__PURE__*/_jsx(Menu, { className: "w-5 h-5" }) }
        )] }
      ),

      open && /*#__PURE__*/
      _jsxs("div", { className: "md:hidden bg-card border-t border-border px-6 py-4 flex flex-col gap-4", children: [
        navLinks.map((l) => /*#__PURE__*/
        _jsx("a", { href: l.href, className: "text-sm font-medium text-foreground", children:
          l.label }, l.label
        )
        ), /*#__PURE__*/
        
isAuthenticated ? (
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-2 text-foreground">
      <CircleUserRound className="w-6 h-6 text-primary" />
      <span className="text-sm font-medium">{(() => {
        try { return JSON.parse(localStorage.getItem("user") || "null")?.name || "My profile"; }
        catch { return "My profile"; }
      })()}</span>
    </div>
  _jsx("button", {
    <button
  onClick={() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    navigate("/");
  }}
>
  Log Out
</button>
  })
  </div>
) : (
  <>
    {_jsx(Link, {
      to: "/signin",
      className: "text-sm font-medium text-foreground",
      children: "Sign in"
    })}
    {_jsx(Link, {
      to: "/register",
      className: "text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-center",
      children: "Get started free"
    })}
  </>
)
] }
      )] }

    ));

}

function Footer() {
  return (/*#__PURE__*/
    _jsx("footer", { className: "border-t border-border py-14 px-6", children: /*#__PURE__*/
      _jsxs("div", { className: "max-w-6xl mx-auto", children: [/*#__PURE__*/
        _jsxs("div", { className: "grid md:grid-cols-4 gap-10 mb-12", children: [/*#__PURE__*/
          _jsxs("div", { children: [/*#__PURE__*/
            _jsxs(Link, { to: "/", className: "flex items-center gap-2 mb-4", children: [/*#__PURE__*/
              _jsx("div", { className: "w-7 h-7 rounded-full bg-primary flex items-center justify-center", children: /*#__PURE__*/
                _jsx(Heart, { className: "w-3.5 h-3.5 text-primary-foreground" }) }
              ), /*#__PURE__*/
              _jsx("span", { className: "font-display text-lg font-medium text-foreground", children: "Therapify" })] }
            ), /*#__PURE__*/
            _jsx("p", { className: "text-sm text-muted-foreground leading-relaxed max-w-xs", children: "Mental wellness support that feels human. AI-powered, always calm, always private." }

            )] }
          ),
          [
          {
            heading: "Product",
            links: [
            { label: "AI Chat", to: "/chat" },
            { label: "Mood Tracking", to: "/mood" },
            { label: "Journal", to: "/journal" },
            { label: "Wellness", to: "/wellness" },
            { label: "Events", to: "/events" }]

          },
          {
            heading: "Company",
            links: [
            { label: "About", to: "/about" },
            { label: "Blog", to: "/blog" }]

          },
          {
            heading: "Legal",
            links: [
            { label: "Privacy", to: "/privacy" },
            { label: "Terms", to: "/terms" },
            { label: "Cookie policy", to: "/cookies" },
            { label: "Crisis resources", to: "/crisis" }]

          }].
          map((col) => /*#__PURE__*/
          _jsxs("div", { children: [/*#__PURE__*/
            _jsx("h5", { className: "text-xs font-semibold text-foreground uppercase tracking-wider mb-4", children:
              col.heading }
            ), /*#__PURE__*/
            _jsx("ul", { className: "flex flex-col gap-2.5", children:
              col.links.map((link) => /*#__PURE__*/
              _jsx("li", { children: /*#__PURE__*/
                _jsx(Link, {
                  to: link.to,
                  className: "text-sm text-muted-foreground hover:text-foreground transition-colors", children:

                  link.label }
                ) }, link.label
              )
              ) }
            )] }, col.heading
          )
          )] }
        ), /*#__PURE__*/
        _jsxs("div", { className: "pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground", children: [/*#__PURE__*/
          _jsx("p", { children: "© 2026 Therapify. Not a substitute for professional medical advice." }), /*#__PURE__*/
          _jsxs("div", { className: "flex items-center gap-1.5", children: [/*#__PURE__*/
            _jsx(Shield, { className: "w-3.5 h-3.5" }), "End-to-end encrypted · Always private"] }

          )] }
        )] }
      ) }
    ));

}

export default function Root() {
  return (/*#__PURE__*/
    _jsxs("div", {
      className: "min-h-screen bg-background",
      style: {
        fontFamily: "'DM Sans', system-ui, sans-serif",
        ["--font-display"]: "'Playfair Display', Georgia, serif"
      }, children: [/*#__PURE__*/

      _jsx("style", { children: `
        .font-display { font-family: var(--font-display); }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { display: none; }
      ` }), /*#__PURE__*/
      _jsx(Nav, {}), /*#__PURE__*/
      _jsx(Outlet, {}), /*#__PURE__*/
      _jsx(Footer, {})] }
    ));

}
