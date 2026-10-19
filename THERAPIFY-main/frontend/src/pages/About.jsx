import { Link } from "react-router";
import { Heart, Shield, Sparkles, ArrowRight } from "lucide-react";import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";

const values = [
{ icon: Heart, title: "Human first", body: "Technology is a means, not an end. Every design decision starts with: does this make someone feel more seen, not less?" },
{ icon: Shield, title: "Privacy by design", body: "End-to-end encryption isn't a feature — it's a baseline. Your inner world stays yours." },
{ icon: Sparkles, title: "Calm over clever", body: "We resist the urge to add. Fewer prompts, gentler nudges, more whitespace. The quieter the tool, the louder your own voice." }];


const team = [
{ name: "Zara Osei", role: "Co-founder & CEO", bio: "Former clinical psychologist. Built Therapify after seeing the gap between people who needed support and those who could access it.", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&h=120&fit=crop&auto=format" },
{ name: "Daniel Park", role: "Co-founder & CTO", bio: "Previously led AI safety research at a major lab. Believes the most important thing AI can do is make humans feel less alone.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format" },
{ name: "Isla Ferreira", role: "Head of Clinical Safety", bio: "Licensed therapist and researcher. Oversees all crisis pathways and ensures every AI interaction meets evidence-based standards.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&auto=format" }];


export default function About() {
  return (/*#__PURE__*/
    _jsxs("div", { className: "min-h-screen pt-24 pb-16", children: [/*#__PURE__*/

      _jsx("section", { className: "px-6 mb-24", children: /*#__PURE__*/
        _jsxs("div", { className: "max-w-3xl mx-auto text-center", children: [/*#__PURE__*/
          _jsx("span", { className: "text-xs font-medium text-primary uppercase tracking-widest", children: "About Therapify" }), /*#__PURE__*/
          _jsxs("h1", { className: "font-display text-5xl md:text-6xl font-medium text-foreground mt-4 mb-6 leading-[1.1]", children: ["Care that reaches", /*#__PURE__*/
            _jsx("br", {}), /*#__PURE__*/_jsx("em", { className: "font-normal text-primary", children: "everyone." })] }
          ), /*#__PURE__*/
          _jsx("p", { className: "text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto", children: "We built Therapify because good mental health support shouldn't depend on luck, location, or income. It should be calm, private, and always available." }


          )] }
        ) }
      ), /*#__PURE__*/


      _jsx("section", { className: "bg-secondary/40 py-20 px-6 mb-24", children: /*#__PURE__*/
        _jsxs("div", { className: "max-w-4xl mx-auto grid md:grid-cols-2 gap-14 items-center", children: [/*#__PURE__*/
          _jsxs("div", { children: [/*#__PURE__*/
            _jsx("span", { className: "text-xs font-medium text-primary uppercase tracking-widest", children: "Our mission" }), /*#__PURE__*/
            _jsxs("h2", { className: "font-display text-4xl font-medium text-foreground mt-3 mb-5", children: ["Make self-understanding", /*#__PURE__*/
              _jsx("br", {}), /*#__PURE__*/_jsx("em", { className: "font-normal", children: "accessible to all." })] }
            ), /*#__PURE__*/
            _jsx("p", { className: "text-muted-foreground leading-relaxed mb-4", children: "Most people who need mental health support never receive it — not because they don't want it, but because it's too expensive, too distant, or too stigmatised." }

            ), /*#__PURE__*/
            _jsx("p", { className: "text-muted-foreground leading-relaxed", children: "Therapify isn't a replacement for therapy. It's a bridge — a daily companion that helps you understand yourself better, so that when you're ready for more, you already know yourself." }

            )] }
          ), /*#__PURE__*/
          _jsx("div", { className: "bg-card rounded-3xl p-8 border border-border", children:
            [
            { number: "2,841", label: "People supported daily" },
            { number: "94%", label: "Report feeling more understood" },
            { number: "47", label: "Countries reached" }].
            map((stat) => /*#__PURE__*/
            _jsxs("div", { className: "flex items-center justify-between py-4 border-b border-border last:border-0", children: [/*#__PURE__*/
              _jsx("span", { className: "text-sm text-muted-foreground", children: stat.label }), /*#__PURE__*/
              _jsx("span", { className: "font-display text-2xl font-medium text-primary", children: stat.number })] }, stat.label
            )
            ) }
          )] }
        ) }
      ), /*#__PURE__*/


      _jsx("section", { className: "px-6 mb-24", children: /*#__PURE__*/
        _jsxs("div", { className: "max-w-4xl mx-auto", children: [/*#__PURE__*/
          _jsxs("div", { className: "text-center mb-12", children: [/*#__PURE__*/
            _jsx("span", { className: "text-xs font-medium text-primary uppercase tracking-widest", children: "What guides us" }), /*#__PURE__*/
            _jsx("h2", { className: "font-display text-4xl font-medium text-foreground mt-3", children: "Our values" })] }
          ), /*#__PURE__*/
          _jsx("div", { className: "grid md:grid-cols-3 gap-6", children:
            values.map((v) => {
              const Icon = v.icon;
              return (/*#__PURE__*/
                _jsxs("div", { className: "bg-card rounded-2xl p-6 border border-border", children: [/*#__PURE__*/
                  _jsx("div", { className: "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4", children: /*#__PURE__*/
                    _jsx(Icon, { className: "w-5 h-5 text-primary" }) }
                  ), /*#__PURE__*/
                  _jsx("h3", { className: "font-display text-lg font-medium text-foreground mb-2", children: v.title }), /*#__PURE__*/
                  _jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: v.body })] }, v.title
                ));

            }) }
          )] }
        ) }
      ), /*#__PURE__*/


      _jsx("section", { className: "bg-secondary/40 py-20 px-6 mb-24", children: /*#__PURE__*/
        _jsxs("div", { className: "max-w-4xl mx-auto", children: [/*#__PURE__*/
          _jsxs("div", { className: "text-center mb-12", children: [/*#__PURE__*/
            _jsx("span", { className: "text-xs font-medium text-primary uppercase tracking-widest", children: "The people behind it" }), /*#__PURE__*/
            _jsx("h2", { className: "font-display text-4xl font-medium text-foreground mt-3", children: "Our team" })] }
          ), /*#__PURE__*/
          _jsx("div", { className: "grid md:grid-cols-3 gap-6", children:
            team.map((member) => /*#__PURE__*/
            _jsxs("div", { className: "bg-card rounded-2xl p-6 border border-border text-center", children: [/*#__PURE__*/
              _jsx("div", { className: "w-20 h-20 rounded-full overflow-hidden bg-muted mx-auto mb-4", children: /*#__PURE__*/
                _jsx("img", { src: member.avatar, alt: member.name, className: "w-full h-full object-cover" }) }
              ), /*#__PURE__*/
              _jsx("h3", { className: "font-medium text-foreground mb-0.5", children: member.name }), /*#__PURE__*/
              _jsx("p", { className: "text-xs text-primary mb-3", children: member.role }), /*#__PURE__*/
              _jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: member.bio })] }, member.name
            )
            ) }
          )] }
        ) }
      ), /*#__PURE__*/


      _jsx("section", { className: "px-6", children: /*#__PURE__*/
        _jsxs("div", { className: "max-w-2xl mx-auto text-center", children: [/*#__PURE__*/
          _jsx("h2", { className: "font-display text-3xl font-medium text-foreground mb-4", children: "Ready to begin?" }), /*#__PURE__*/
          _jsx("p", { className: "text-muted-foreground mb-8", children: "Join thousands who've found their footing with Therapify. Free to start, no pressure." }), /*#__PURE__*/
          _jsxs("div", { className: "flex gap-3 justify-center", children: [/*#__PURE__*/
            _jsxs(Link, { to: "/register", className: "flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full font-medium hover:bg-primary/90 transition-all", children: ["Get started ", /*#__PURE__*/
              _jsx(ArrowRight, { className: "w-4 h-4" })] }
            ), /*#__PURE__*/
            _jsx(Link, { to: "/blog", className: "border border-border text-foreground px-7 py-3.5 rounded-full font-medium hover:bg-secondary/60 transition-all", children: "Read our blog" }

            )] }
          )] }
        ) }
      )] }
    ));

}