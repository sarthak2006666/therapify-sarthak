import { Link } from "react-router";
import { ArrowRight } from "lucide-react";import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";

const posts = [
{ slug: "why-10-seconds-matters", date: "Aug 15, 2026", tag: "Mood tracking", title: "Why 10 seconds of honest logging changes everything", excerpt: "Consistency, not depth, is what makes mood tracking transformative. Here's the science behind why brief daily check-ins outperform weekly reviews.", readTime: "5 min read", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=48&h=48&fit=crop&auto=format", author: "Zara Osei" },
{ slug: "ai-therapy-boundaries", date: "Aug 8, 2026", tag: "AI & wellbeing", title: "What AI can and can't do in mental health support", excerpt: "There's a lot of hype — and a lot of fear — about AI in therapy. We want to be honest about exactly where it helps and where it falls short.", readTime: "8 min read", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&auto=format", author: "Daniel Park" },
{ slug: "journaling-for-non-writers", date: "Jul 30, 2026", tag: "Journaling", title: "You don't have to be a writer to journal", excerpt: "Three words. A single sentence. A voice note. Journaling is about contact with yourself, not craft. A practical guide for people who hate writing.", readTime: "4 min read", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=48&h=48&fit=crop&auto=format", author: "Isla Ferreira" },
{ slug: "safety-layer-design", date: "Jul 22, 2026", tag: "Product", title: "How we designed our crisis safety layer", excerpt: "Safety prompts in apps often feel cold, abrupt, or alarm-like. We spent months designing something that feels like care. Here's our process.", readTime: "6 min read", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=48&h=48&fit=crop&auto=format", author: "Zara Osei" },
{ slug: "box-breathing-science", date: "Jul 14, 2026", tag: "Wellness", title: "The neuroscience behind box breathing", excerpt: "Box breathing activates the vagus nerve and shifts the autonomic nervous system from fight-or-flight to rest-and-digest. Here's exactly how.", readTime: "7 min read", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&auto=format", author: "Daniel Park" }];


export default function Blog() {
  return (/*#__PURE__*/
    _jsx("div", { className: "min-h-screen pt-24 pb-16 px-6", children: /*#__PURE__*/
      _jsxs("div", { className: "max-w-4xl mx-auto", children: [/*#__PURE__*/
        _jsxs("div", { className: "mb-14", children: [/*#__PURE__*/
          _jsx("span", { className: "text-xs font-medium text-primary uppercase tracking-widest", children: "The Therapify blog" }), /*#__PURE__*/
          _jsxs("h1", { className: "font-display text-5xl font-medium text-foreground mt-3 mb-4", children: ["Thinking about", /*#__PURE__*/
            _jsx("br", {}), /*#__PURE__*/_jsx("em", { className: "font-normal", children: "mental wellness." })] }
          ), /*#__PURE__*/
          _jsx("p", { className: "text-muted-foreground max-w-lg", children: "Research-grounded writing on mood, AI, journaling, and the quiet work of self-understanding." }

          )] }
        ), /*#__PURE__*/


        _jsxs("div", { className: "bg-card rounded-3xl p-8 border border-border mb-8 hover:shadow-md transition-all group cursor-pointer", children: [/*#__PURE__*/
          _jsx("span", { className: "text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full", children: posts[0].tag }), /*#__PURE__*/
          _jsx("h2", { className: "font-display text-2xl font-medium text-foreground mt-4 mb-3 group-hover:text-primary transition-colors", children:
            posts[0].title }
          ), /*#__PURE__*/
          _jsx("p", { className: "text-muted-foreground leading-relaxed mb-6", children: posts[0].excerpt }), /*#__PURE__*/
          _jsxs("div", { className: "flex items-center justify-between", children: [/*#__PURE__*/
            _jsxs("div", { className: "flex items-center gap-2.5", children: [/*#__PURE__*/
              _jsx("img", { src: posts[0].avatar, alt: posts[0].author, className: "w-8 h-8 rounded-full object-cover" }), /*#__PURE__*/
              _jsx("span", { className: "text-sm text-foreground", children: posts[0].author }), /*#__PURE__*/
              _jsx("span", { className: "text-muted-foreground", children: "·" }), /*#__PURE__*/
              _jsx("span", { className: "text-sm text-muted-foreground", children: posts[0].date }), /*#__PURE__*/
              _jsx("span", { className: "text-muted-foreground", children: "·" }), /*#__PURE__*/
              _jsx("span", { className: "text-sm text-muted-foreground", children: posts[0].readTime })] }
            ), /*#__PURE__*/
            _jsx(ArrowRight, { className: "w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" })] }
          )] }
        ), /*#__PURE__*/

        _jsx("div", { className: "grid md:grid-cols-2 gap-5", children:
          posts.slice(1).map((post) => /*#__PURE__*/
          _jsxs("div", { className: "bg-card rounded-2xl p-6 border border-border hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer", children: [/*#__PURE__*/
            _jsx("span", { className: "text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full", children: post.tag }), /*#__PURE__*/
            _jsx("h3", { className: "font-display text-base font-medium text-foreground mt-3 mb-2 group-hover:text-primary transition-colors leading-snug", children:
              post.title }
            ), /*#__PURE__*/
            _jsx("p", { className: "text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2", children: post.excerpt }), /*#__PURE__*/
            _jsxs("div", { className: "flex items-center gap-2", children: [/*#__PURE__*/
              _jsx("img", { src: post.avatar, alt: post.author, className: "w-6 h-6 rounded-full object-cover" }), /*#__PURE__*/
              _jsxs("span", { className: "text-xs text-muted-foreground", children: [post.author, " · ", post.readTime] })] }
            )] }, post.slug
          )
          ) }
        )] }
      ) }
    ));

}