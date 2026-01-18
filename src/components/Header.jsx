/**
 * 공통 헤더 컴포넌트
 */
"use client";

import { useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";

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

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NavLink = styled(Link)`
  font-size: 14px;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.15s;

  &:hover {
    color: var(--text-primary);
    background: var(--bg-secondary);
  }
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: var(--text-muted);
  }
`;

const Avatar = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
`;

const LoginButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.9;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 4px;
  min-width: 160px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: none;
  color: var(--text-primary);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;

  &:hover {
    background: var(--bg-secondary);
  }
`;

const DropdownLink = styled(Link)`
  display: block;
  padding: 10px 12px;
  color: var(--text-primary);
  font-size: 14px;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.15s;

  &:hover {
    background: var(--bg-secondary);
  }
`;

const UserSection = styled.div`
  position: relative;
`;

export default function Header() {
  const { user, loading, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
  };

  if (loading) {
    return (
      <HeaderContainer>
        <HeaderContent>
          <Logo href="/">unJ</Logo>
        </HeaderContent>
      </HeaderContainer>
    );
  }

  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <Logo href="/">unJ</Logo>

          <Nav>
            {user ? (
              <UserSection>
                <UserButton onClick={() => setShowDropdown(!showDropdown)}>
                  <Avatar>{user.name.charAt(0).toUpperCase()}</Avatar>
                  {user.name}
                </UserButton>

                {showDropdown && (
                  <Dropdown>
                    <DropdownLink
                      href="/my-schedule"
                      onClick={() => setShowDropdown(false)}
                    >
                      내 일정
                    </DropdownLink>
                    <DropdownItem onClick={handleLogout}>로그아웃</DropdownItem>
                  </Dropdown>
                )}
              </UserSection>
            ) : (
              <LoginButton onClick={() => setShowAuthModal(true)}>
                로그인
              </LoginButton>
            )}
          </Nav>
        </HeaderContent>
      </HeaderContainer>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
