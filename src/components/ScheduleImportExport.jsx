/**
 * 내 일정 Import/Export 플로팅 버튼 + 모달
 * - 이벤트 페이지 참가 후 우하단에 표시
 * - Import: 내 일정(요일) → 이벤트 가용시간(날짜)
 * - Export: 이벤트 가용시간 → 내 일정(요일)으로 저장
 */
"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import AvailabilityGrid from "./AvailabilityGrid";
import {
  loadMySchedule,
  saveMySchedule,
  importToEvent,
  exportFromEvent,
} from "@/lib/mySchedule";

const FAB = styled.button`
  position: fixed;
  bottom: 24px;
  right: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
  }

  &:active {
    transform: scale(0.96);
  }

  @media (max-width: 768px) {
    bottom: 20px;
    right: 16px;
    width: 48px;
    height: 48px;
    font-size: 18px;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 200;
  padding: 20px 16px;
  overflow-y: auto;

  @media (max-width: 480px) {
    align-items: flex-end;
    padding: 0;
  }
`;

const Modal = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 24px;
  width: 460px;
  max-width: 100%;
  margin: auto 0;

  @media (max-width: 480px) {
    border-radius: 20px 20px 0 0;
    width: 100%;
    padding: 24px 20px 32px;
  }
`;

const ModalTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
`;

const ModalDesc = styled.p`
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 20px;
  line-height: 1.5;
`;

const TabRow = styled.div`
  display: flex;
  gap: 0;
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 3px;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: ${(props) => (props.$active ? "var(--bg-card)" : "transparent")};
  color: ${(props) => (props.$active ? "var(--text-primary)" : "var(--text-muted)")};
  font-size: 13px;
  font-weight: ${(props) => (props.$active ? "500" : "400")};
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: ${(props) => (props.$active ? "0 1px 4px rgba(0,0,0,0.1)" : "none")};
`;

const InfoBox = styled.div`
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
`;

const EmptyBox = styled.div`
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 16px;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid ${(props) => (props.$selected ? "var(--accent)" : "var(--border-subtle)")};
  border-radius: 8px;
  cursor: pointer;
  background: ${(props) => (props.$selected ? "rgba(76, 175, 80, 0.06)" : "transparent")};
  transition: border-color 0.15s;
`;

const RadioText = styled.div`
  font-size: 13px;

  strong {
    display: block;
    color: var(--text-primary);
    margin-bottom: 2px;
  }

  span {
    color: var(--text-muted);
    font-size: 12px;
  }
`;

const Buttons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 10px 16px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: none;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;

  &:hover {
    border-color: var(--text-muted);
  }
`;

const ActionButton = styled.button`
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const PreviewWrapper = styled.div`
  margin-bottom: 16px;
`;

const SuccessMsg = styled.div`
  text-align: center;
  padding: 12px;
  font-size: 14px;
  color: var(--accent);
  font-weight: 500;
`;

export default function ScheduleImportExport({ event, myAvailability, onImport }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("import"); // "import" | "export"
  const [mergeMode, setMergeMode] = useState("merge");
  const [myAvail, setMyAvail] = useState([]);
  const [exportDone, setExportDone] = useState(false);
  const [importDone, setImportDone] = useState(false);

  useEffect(() => {
    if (open) {
      const { availability } = loadMySchedule();
      setMyAvail(availability || []);
      setExportDone(false);
      setImportDone(false);
    }
  }, [open]);

  const mySlotCount = myAvail.length;

  const handleImport = () => {
    const newAvailability = importToEvent(
      myAvail,
      event.dates,
      event.startTime,
      event.endTime,
      myAvailability,
      mergeMode
    );
    onImport(newAvailability);
    setImportDone(true);
    setTimeout(() => setOpen(false), 900);
  };

  const handleExport = () => {
    const exported = exportFromEvent(myAvailability, event.dates);
    saveMySchedule(exported);
    setMySlotCount(exported.length);
    setExportDone(true);
  };


  return (
    <>
      <FAB onClick={() => setOpen(true)} title="내 일정 가져오기/저장">
        📋
      </FAB>

      {open && (
        <Overlay onClick={() => setOpen(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>내 일정</ModalTitle>

            <TabRow>
              <Tab $active={tab === "import"} onClick={() => { setTab("import"); setImportDone(false); }}>
                가져오기
              </Tab>
              <Tab $active={tab === "export"} onClick={() => { setTab("export"); setExportDone(false); }}>
                저장하기
              </Tab>
            </TabRow>

            {tab === "import" && (
              <>
                <ModalDesc>
                  홈페이지에 저장해 둔 내 일정을 이 이벤트에 가져옵니다.
                  요일이 일치하는 시간대만 반영됩니다.
                </ModalDesc>

                {mySlotCount === 0 ? (
                  <EmptyBox>
                    저장된 내 일정이 없습니다.<br />
                    홈페이지에서 먼저 내 일정을 등록해주세요.
                  </EmptyBox>
                ) : (
                  <>
                    <PreviewWrapper>
                      <AvailabilityGrid
                        mode="personal"
                        startTime={event.startTime}
                        endTime={event.endTime}
                        availability={myAvail}
                        readOnly
                        gridTitle={`내 일정 미리보기 (${event.startTime}:00 ~ ${event.endTime}:00)`}
                      />
                    </PreviewWrapper>

                    <RadioGroup style={{ marginTop: "4px" }}>
                      <RadioLabel $selected={mergeMode === "merge"}>
                        <input
                          type="radio"
                          name="mergeMode"
                          value="merge"
                          checked={mergeMode === "merge"}
                          onChange={() => setMergeMode("merge")}
                        />
                        <RadioText>
                          <strong>병합</strong>
                          <span>기존 입력 내용은 유지하고, 내 일정을 추가합니다</span>
                        </RadioText>
                      </RadioLabel>
                      <RadioLabel $selected={mergeMode === "replace"}>
                        <input
                          type="radio"
                          name="mergeMode"
                          value="replace"
                          checked={mergeMode === "replace"}
                          onChange={() => setMergeMode("replace")}
                        />
                        <RadioText>
                          <strong>덮어쓰기</strong>
                          <span>기존 입력 내용을 지우고, 내 일정으로 교체합니다</span>
                        </RadioText>
                      </RadioLabel>
                    </RadioGroup>
                  </>
                )}

                {importDone && <SuccessMsg>✓ 가져왔습니다!</SuccessMsg>}

                <Buttons>
                  <CancelButton onClick={() => setOpen(false)}>취소</CancelButton>
                  <ActionButton
                    onClick={handleImport}
                    disabled={mySlotCount === 0 || importDone}
                  >
                    가져오기
                  </ActionButton>
                </Buttons>
              </>
            )}

            {tab === "export" && (
              <>
                <ModalDesc>
                  현재 입력한 가용시간을 내 일정으로 저장합니다.
                  기존에 저장된 내 일정은 덮어써집니다.
                </ModalDesc>

                <InfoBox>
                  💾 저장할 슬롯: <strong style={{ color: "var(--text-primary)" }}>{myAvailability.length}개</strong>
                  {exportDone && mySlotCount > 0 && (
                    <span style={{ marginLeft: 8, color: "var(--accent)" }}>→ 저장 완료</span>
                  )}
                </InfoBox>

                {myAvailability.length === 0 && (
                  <EmptyBox>
                    아직 가용시간을 입력하지 않았습니다.
                  </EmptyBox>
                )}

                {exportDone && <SuccessMsg>✓ 내 일정에 저장했습니다!</SuccessMsg>}

                <Buttons>
                  <CancelButton onClick={() => setOpen(false)}>닫기</CancelButton>
                  <ActionButton
                    onClick={handleExport}
                    disabled={myAvailability.length === 0 || exportDone}
                  >
                    내 일정에 저장
                  </ActionButton>
                </Buttons>
              </>
            )}
          </Modal>
        </Overlay>
      )}
    </>
  );
}
