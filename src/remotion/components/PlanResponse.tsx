import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

export const PlanResponse: React.FC = () => {
  const frame = useCurrentFrame();

  const introText =
    "카카오뱅크 Kode Runner 2026 행사의 부스 시연용 테트리스 웹게임 제작을 위한 📄 구현 계획서를 작성했습니다.";

  const points = [
    "1. 카카오뱅크 브랜딩 & 테크 디자이너 감성: KakaoBank Signature Yellow ( #FFDE00 ) + 다크 사이버펑크 앰비언스, 네온 블록 디자인 및 유리 모피즘 UI.",
    "2. 부스 시연 최적화 모드:\n   • 2분 Kode Sprint (부스 모드): 2분간 최고 점수를 다투는 빠른 순환 모드 + 랭킹 등록\n   • 40 라인 코드 리팩토링 모드: 40줄을 가장 빠르게 지우는 타임어택\n   • 엔드리스 마라톤 모드: 속도가 점차 증가하는 클래식 모드",
    "3. 개발자 테마 특수 기능:\n   • Kode Combo: 연쇄 삭제 시 코드 파티클 폭발 및 점수 멀티플레이어\n   • Bug Fix / Refactor Booster: 라인 제거 게이지 충전 시 특수 레이저 파워업 제공",
    "4. 풍부한 효과:\n   • 외부 파일 필요 없는 Web Audio API 오디오 신디사이저 (블록 이동, 회전, 하드드롭, 테트리스, 사운드 FX & BGM)\n   • 파티클 파괴 효과 및 화면 흔들림 (Screen Shake)\n   • 부스 유휴 상태용 AI 데모 플레이 (Attract Mode)",
  ];

  const outroText =
    "계획서를 확인하시고 Proceed 버튼을 누르시거나 승인해 주시면 개발을 시작겠습니다!";

  // Fast Progressive streaming frames starting at frame 280
  const introTypedLength = Math.min(
    introText.length,
    Math.floor(
      interpolate(frame, [280, 330], [0, introText.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  const p1Length = Math.min(
    points[0].length,
    Math.floor(
      interpolate(frame, [335, 385], [0, points[0].length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  const p2Length = Math.min(
    points[1].length,
    Math.floor(
      interpolate(frame, [390, 445], [0, points[1].length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  const p3Length = Math.min(
    points[2].length,
    Math.floor(
      interpolate(frame, [450, 495], [0, points[2].length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  const p4Length = Math.min(
    points[3].length,
    Math.floor(
      interpolate(frame, [500, 550], [0, points[3].length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  const outroLength = Math.min(
    outroText.length,
    Math.floor(
      interpolate(frame, [555, 590], [0, outroText.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  if (frame < 280) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        fontSize: 13.5,
        color: "#1E2328",
        lineHeight: 1.5,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Intro Sentence */}
      <div>
        <span>{introText.slice(0, introTypedLength)}</span>
        {frame >= 280 && frame < 332 && (
          <span style={{ opacity: Math.floor(frame / 6) % 2 === 0 ? 1 : 0, color: "#0088FF", fontWeight: 700, marginLeft: 2 }}>▌</span>
        )}
      </div>

      {/* Key Elements Section Header */}
      {frame >= 330 && (
        <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", marginTop: 4 }}>
          주요 핵심 요소
        </div>
      )}

      {/* Point 1 */}
      {frame >= 335 && (
        <div style={{ whiteSpace: "pre-wrap" }}>
          <span>{points[0].slice(0, p1Length)}</span>
          {frame >= 335 && frame < 388 && (
            <span style={{ opacity: Math.floor(frame / 6) % 2 === 0 ? 1 : 0, color: "#0088FF", fontWeight: 700, marginLeft: 2 }}>▌</span>
          )}
        </div>
      )}

      {/* Point 2 */}
      {frame >= 390 && (
        <div style={{ whiteSpace: "pre-wrap" }}>
          <span>{points[1].slice(0, p2Length)}</span>
          {frame >= 390 && frame < 448 && (
            <span style={{ opacity: Math.floor(frame / 6) % 2 === 0 ? 1 : 0, color: "#0088FF", fontWeight: 700, marginLeft: 2 }}>▌</span>
          )}
        </div>
      )}

      {/* Point 3 */}
      {frame >= 450 && (
        <div style={{ whiteSpace: "pre-wrap" }}>
          <span>{points[2].slice(0, p3Length)}</span>
          {frame >= 450 && frame < 498 && (
            <span style={{ opacity: Math.floor(frame / 6) % 2 === 0 ? 1 : 0, color: "#0088FF", fontWeight: 700, marginLeft: 2 }}>▌</span>
          )}
        </div>
      )}

      {/* Point 4 */}
      {frame >= 500 && (
        <div style={{ whiteSpace: "pre-wrap" }}>
          <span>{points[3].slice(0, p4Length)}</span>
          {frame >= 500 && frame < 553 && (
            <span style={{ opacity: Math.floor(frame / 6) % 2 === 0 ? 1 : 0, color: "#0088FF", fontWeight: 700, marginLeft: 2 }}>▌</span>
          )}
        </div>
      )}

      {/* Outro Sentence */}
      {frame >= 555 && (
        <div style={{ marginTop: 4 }}>
          <span>{outroText.slice(0, outroLength)}</span>
          {frame >= 555 && frame < 593 && (
            <span style={{ opacity: Math.floor(frame / 6) % 2 === 0 ? 1 : 0, color: "#0088FF", fontWeight: 700, marginLeft: 2 }}>▌</span>
          )}
        </div>
      )}
    </div>
  );
};
