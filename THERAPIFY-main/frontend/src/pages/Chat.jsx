import { useState, useRef, useEffect } from "react";
import { Sparkles, ArrowUp, Shield, BookOpen, TrendingUp } from "lucide-react";
import { Link } from "react-router";import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";



const initialMessages = [
{ role: "ai", text: "Hello, and welcome. I'm here whenever you're ready to talk. How are you feeling today?" }];


const suggestions = [
"I'm feeling anxious today",
"I want to reflect on my week",
"I'm having trouble sleeping",
"Just checking in"];


export default function Chat() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      const responses = [
      "Thank you for sharing that. Can you tell me more about what's been on your mind?",
      "I hear you. That sounds like a lot to carry. What would feel most helpful right now?",
      "It takes courage to put that into words. What do you think is underneath that feeling?",
      "That makes a lot of sense. How long have you been feeling this way?",
      "I appreciate you opening up. You're not alone in this."];

      const reply = {
        role: "ai",
        text: responses[Math.floor(Math.random() * responses.length)]
      };
      setMessages((prev) => [...prev, reply]);
    }, 1000);
  };

  return (/*#__PURE__*/
    _jsx("div", { className: "min-h-screen pt-20 flex flex-col", children: /*#__PURE__*/
      _jsxs("div", { className: "max-w-3xl mx-auto w-full flex-1 flex flex-col px-4 pb-6", children: [/*#__PURE__*/

        _jsxs("div", { className: "flex items-center justify-between py-4 border-b border-border mb-4", children: [/*#__PURE__*/
          _jsxs("div", { className: "flex items-center gap-3", children: [/*#__PURE__*/
            _jsx("div", { className: "w-9 h-9 rounded-full bg-accent/30 flex items-center justify-center", children: /*#__PURE__*/
              _jsx(Sparkles, { className: "w-5 h-5 text-accent-foreground" }) }
            ), /*#__PURE__*/
            _jsxs("div", { children: [/*#__PURE__*/
              _jsx("p", { className: "text-sm font-medium text-foreground", children: "Therapify AI" }), /*#__PURE__*/
              _jsxs("p", { className: "text-xs text-primary flex items-center gap-1", children: [/*#__PURE__*/
                _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-primary inline-block" }), " Online"] }
              )] }
            )] }
          ), /*#__PURE__*/
          _jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [/*#__PURE__*/
            _jsx(Shield, { className: "w-3.5 h-3.5" }), " End-to-end encrypted"] }
          )] }
        ), /*#__PURE__*/


        _jsxs("div", { className: "flex-1 overflow-y-auto flex flex-col gap-4 pb-4 [&::-webkit-scrollbar]:hidden", children: [
          messages.map((msg, i) => /*#__PURE__*/
          _jsxs("div", { className: `flex ${msg.role === "user" ? "justify-end" : "justify-start"}`, children: [
            msg.role === "ai" && /*#__PURE__*/
            _jsx("div", { className: "w-7 h-7 rounded-full bg-accent/30 flex items-center justify-center shrink-0 mr-2 mt-0.5", children: /*#__PURE__*/
              _jsx(Sparkles, { className: "w-3.5 h-3.5 text-accent-foreground" }) }
            ), /*#__PURE__*/

            _jsx("div", {
              className: `max-w-[78%] text-sm leading-relaxed px-4 py-3 rounded-2xl ${
              msg.role === "user" ?
              "bg-primary text-primary-foreground rounded-br-sm" :
              "bg-card text-foreground rounded-bl-sm border border-border"}`, children:


              msg.text }
            )] }, i
          )
          ), /*#__PURE__*/
          _jsx("div", { ref: bottomRef })] }
        ), /*#__PURE__*/


        _jsx("div", { className: "flex gap-2 flex-wrap mb-3", children:
          suggestions.map((s) => /*#__PURE__*/
          _jsx("button", {

            onClick: () => send(s),
            className: "text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors", children:

            s }, s
          )
          ) }
        ), /*#__PURE__*/


        _jsxs("div", { className: "flex gap-2 items-end", children: [/*#__PURE__*/
          _jsx("textarea", {
            value: input,
            onChange: (e) => setInput(e.target.value),
            onKeyDown: (e) => {if (e.key === "Enter" && !e.shiftKey) {e.preventDefault();send(input);}},
            placeholder: "Share what's on your mind…",
            rows: 1,
            className: "flex-1 bg-input-background rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all" }
          ), /*#__PURE__*/
          _jsx("button", {
            onClick: () => send(input),
            className: "w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors shrink-0", children: /*#__PURE__*/

            _jsx(ArrowUp, { className: "w-4 h-4 text-primary-foreground" }) }
          )] }
        ), /*#__PURE__*/


        _jsxs("div", { className: "mt-4 flex items-start gap-2.5 p-3.5 bg-accent/10 rounded-2xl border border-accent/20", children: [/*#__PURE__*/
          _jsx(Shield, { className: "w-4 h-4 text-accent-foreground mt-0.5 shrink-0" }), /*#__PURE__*/
          _jsxs("p", { className: "text-xs text-foreground/70 leading-relaxed", children: ["If you're in crisis or need immediate support, please visit our",
            " ", /*#__PURE__*/
            _jsx(Link, { to: "/crisis", className: "text-primary underline", children: "crisis resources" }), " page or contact a helpline."] }
          )] }
        ), /*#__PURE__*/


        _jsxs("div", { className: "grid grid-cols-2 gap-3 mt-4", children: [/*#__PURE__*/
          _jsxs(Link, { to: "/mood", className: "flex items-center gap-2 p-3 bg-card rounded-xl border border-border hover:shadow-sm transition-all text-sm font-medium text-foreground", children: [/*#__PURE__*/
            _jsx(TrendingUp, { className: "w-4 h-4 text-primary" }), " Log your mood"] }
          ), /*#__PURE__*/
          _jsxs(Link, { to: "/journal", className: "flex items-center gap-2 p-3 bg-card rounded-xl border border-border hover:shadow-sm transition-all text-sm font-medium text-foreground", children: [/*#__PURE__*/
            _jsx(BookOpen, { className: "w-4 h-4 text-primary" }), " Open journal"] }
          )] }
        )] }
      ) }
    ));

}