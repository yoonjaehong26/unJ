/**
 * 로그인/회원가입 모달
 */
"use client";

import { useState } from "react";
import styled from "styled-components";
import { useAuth } from "@/context/AuthContext";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 380px;
  margin: 20px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  background: var(--bg-secondary);
  padding: 4px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: ${(props) => (props.$active ? "var(--bg-card)" : "transparent")};
  color: ${(props) =>
    props.$active ? "var(--text-primary)" : "var(--text-muted)"};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const InputGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--text-secondary);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--accent);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
  margin-top: 6px;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Error = styled.p`
  color: #ef4444;
  font-size: 13px;
  text-align: center;
  margin-top: 8px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 24px;
  cursor: pointer;
  line-height: 1;

  &:hover {
    color: var(--text-primary);
  }
`;

const ModalWrapper = styled.div`
  position: relative;
`;

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState("login"); // login | register
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "login") {
        await login(username, password);
      } else {
        await register(username, password, name);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <ModalWrapper>
          <CloseButton onClick={onClose}>&times;</CloseButton>
          <Title>일정 조율</Title>

          <Tabs>
            <Tab $active={tab === "login"} onClick={() => setTab("login")}>
              로그인
            </Tab>
            <Tab $active={tab === "register"} onClick={() => setTab("register")}>
              회원가입
            </Tab>
          </Tabs>

          <Form onSubmit={handleSubmit}>
            {tab === "register" && (
              <InputGroup>
                <Label>이름</Label>
                <Input
                  type="text"
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </InputGroup>
            )}

            <InputGroup>
              <Label>아이디</Label>
              <Input
                type="text"
                placeholder="영문, 숫자, 밑줄 (3~20자)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={20}
              />
            </InputGroup>

            <InputGroup>
              <Label>비밀번호</Label>
              <Input
                type="password"
                placeholder="4자 이상"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
              />
            </InputGroup>

            <Button type="submit" disabled={loading}>
              {loading
                ? "처리 중..."
                : tab === "login"
                ? "로그인"
                : "가입하기"}
            </Button>

            {error && <Error>{error}</Error>}
          </Form>
        </ModalWrapper>
      </Modal>
    </Overlay>
  );
}

