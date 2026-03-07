/**
 * 공통 헤더 컴포넌트
 */
"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import Link from "next/link";

const HeaderContainer = styled.header`
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-subtle);
  padding: 12px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;

  &:hover {
    color: var(--accent);
  }
`;

const ThemeToggle = styled.button`
  background: none;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 16px;
  padding: 4px 10px;
  line-height: 1;
  transition: border-color 0.2s, color 0.2s;

  &:hover {
    border-color: var(--border-active);
    color: var(--text-primary);
  }
`;

export default function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved ? saved === "dark" : prefersDark;
    setIsDark(dark);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo href="/">unJ</Logo>
        <ThemeToggle onClick={toggleTheme} aria-label="테마 전환">
          {isDark ? "☀️" : "🌙"}
        </ThemeToggle>
      </HeaderContent>
    </HeaderContainer>
  );
}
