/**
 * 공통 헤더 컴포넌트
 */
"use client";

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

export default function Header() {
  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo href="/">unJ</Logo>
      </HeaderContent>
    </HeaderContainer>
  );
}
