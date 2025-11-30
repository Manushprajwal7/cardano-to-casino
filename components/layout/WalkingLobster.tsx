import React from "react";

// Cute Walking Lobster and Husky Component
export default function WalkingLobster() {
  return (
    <>
      <div
        className="fixed top-0 left-0 w-full h-16 pointer-events-none overflow-hidden"
        style={{ zIndex: 9999 }}
      >
        {/* Husky walking separately */}
        <div className="husky-walk">
          <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ears */}
            <path d="M15 10 L10 5 L8 8 L12 15 Z" fill="#1a1a1a" />
            <path d="M35 10 L40 5 L42 8 L38 15 Z" fill="#1a1a1a" />
            <path d="M15 10 L11 7 L10 10 L13 14 Z" fill="#e5e5e5" />
            <path d="M35 10 L39 7 L40 10 L37 14 Z" fill="#e5e5e5" />

            {/* Head outline */}
            <circle cx="25" cy="25" r="18" fill="#1a1a1a" />

            {/* Face white area */}
            <ellipse cx="25" cy="27" rx="14" ry="15" fill="white" />

            {/* Gray fur patches */}
            <ellipse cx="15" cy="22" rx="6" ry="8" fill="#d1d1d1" />
            <ellipse cx="35" cy="22" rx="6" ry="8" fill="#d1d1d1" />
            <path d="M18 15 Q25 12 32 15" fill="#d1d1d1" />

            {/* Eyes */}
            <ellipse cx="20" cy="24" rx="4" ry="5" fill="#6bb6ff" />
            <ellipse cx="30" cy="24" rx="4" ry="5" fill="#6bb6ff" />
            <circle cx="19.5" cy="23" r="1.5" fill="white" />
            <circle cx="29.5" cy="23" r="1.5" fill="white" />
            <ellipse cx="20" cy="25" rx="2" ry="3" fill="#1a1a1a" />
            <ellipse cx="30" cy="25" rx="2" ry="3" fill="#1a1a1a" />

            {/* Nose */}
            <ellipse cx="25" cy="31" rx="3" ry="2.5" fill="#4a4a4a" />

            {/* Mouth */}
            <path
              d="M25 31 L23 34"
              stroke="#1a1a1a"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M25 31 L27 34"
              stroke="#1a1a1a"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />

            {/* Tongue */}
            <ellipse cx="25" cy="36" rx="4" ry="3" fill="#ff9eb5" />

            {/* Whisker dots */}
            <circle cx="16" cy="28" r="1" fill="#1a1a1a" />
            <circle cx="34" cy="28" r="1" fill="#1a1a1a" />
          </svg>
        </div>

        {/* Lobster walking separately */}
        <div className="lobster-walk">
          <svg
            width="60"
            height="50"
            viewBox="0 0 60 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="lobster-svg"
          >
            {/* Body */}
            <ellipse cx="30" cy="28" rx="12" ry="8" fill="#E63946" />

            {/* Tail segments */}
            <ellipse cx="42" cy="28" rx="6" ry="5" fill="#DC2F3D" />
            <ellipse cx="48" cy="28" rx="4" ry="4" fill="#C52834" />
            <path
              d="M50 26 L55 22 L54 28 L55 34 L50 30"
              fill="#E63946"
              className="tail-fan"
            />

            {/* Head */}
            <ellipse cx="20" cy="26" rx="6" ry="7" fill="#E63946" />

            {/* Eyes with sparkle */}
            <circle cx="18" cy="23" r="2.5" fill="#1A1A1A" />
            <circle cx="18" cy="22.5" r="1" fill="#FFFFFF" />
            <circle cx="22" cy="23" r="2.5" fill="#1A1A1A" />
            <circle cx="22" cy="22.5" r="1" fill="#FFFFFF" />

            {/* Cute smile */}
            <path
              d="M17 27 Q20 29 23 27"
              stroke="#1A1A1A"
              strokeWidth="1"
              fill="none"
              strokeLinecap="round"
            />

            {/* Antennae */}
            <path
              d="M18 20 Q16 15 14 12"
              stroke="#C52834"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              className="antenna-left"
            />
            <circle cx="14" cy="12" r="1.5" fill="#FFB703" />

            <path
              d="M22 20 Q24 15 26 12"
              stroke="#C52834"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              className="antenna-right"
            />
            <circle cx="26" cy="12" r="1.5" fill="#FFB703" />

            {/* Left Claw */}
            <g className="claw-left">
              <ellipse cx="16" cy="30" rx="3" ry="4" fill="#E63946" />
              <path
                d="M14 32 L10 35 Q8 36 9 37 L11 36 Q10 35 12 34 Z"
                fill="#DC2F3D"
              />
              <path
                d="M14 32 L10 29 Q8 28 9 27 L11 28 Q10 29 12 30 Z"
                fill="#DC2F3D"
              />
            </g>

            {/* Right Claw */}
            <g className="claw-right">
              <ellipse cx="24" cy="30" rx="3" ry="4" fill="#E63946" />
              <path
                d="M26 32 L30 35 Q32 36 31 37 L29 36 Q30 35 28 34 Z"
                fill="#DC2F3D"
              />
              <path
                d="M26 32 L30 29 Q32 28 31 27 L29 28 Q30 29 28 30 Z"
                fill="#DC2F3D"
              />
            </g>

            {/* Walking legs */}
            <g className="legs">
              <line
                x1="25"
                y1="32"
                x2="23"
                y2="38"
                stroke="#C52834"
                strokeWidth="2"
                strokeLinecap="round"
                className="leg1"
              />
              <line
                x1="28"
                y1="32"
                x2="27"
                y2="38"
                stroke="#C52834"
                strokeWidth="2"
                strokeLinecap="round"
                className="leg2"
              />
              <line
                x1="31"
                y1="32"
                x2="31"
                y2="38"
                stroke="#C52834"
                strokeWidth="2"
                strokeLinecap="round"
                className="leg3"
              />
              <line
                x1="34"
                y1="32"
                x2="35"
                y2="38"
                stroke="#C52834"
                strokeWidth="2"
                strokeLinecap="round"
                className="leg4"
              />
            </g>

            {/* Cute belly spots */}
            <circle cx="28" cy="28" r="1" fill="#DC2F3D" opacity="0.5" />
            <circle cx="32" cy="27" r="0.8" fill="#DC2F3D" opacity="0.5" />
          </svg>
        </div>
      </div>

      <style jsx>{`
        /* Husky walks first */
        .husky-walk {
          position: absolute;
          top: 8px;
          animation: walk 15s linear infinite;
        }

        .husky-walk svg {
          animation: husky-bounce 0.6s ease-in-out infinite;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        @keyframes husky-bounce {
          0%,
          100% {
            transform: translateY(0) rotate(-2deg);
          }
          50% {
            transform: translateY(-4px) rotate(2deg);
          }
        }

        /* Lobster follows behind */
        .lobster-walk {
          position: absolute;
          top: 8px;
          animation: walk 15s linear infinite;
          animation-delay: -1s; /* Starts slightly behind husky */
        }

        @keyframes walk {
          0% {
            left: -80px;
          }
          100% {
            left: calc(100% + 80px);
          }
        }

        .lobster-svg {
          animation: bounce 0.5s ease-in-out infinite;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-3px) rotate(2deg);
          }
        }

        .antenna-left {
          animation: wiggle-left 0.6s ease-in-out infinite;
          transform-origin: 18px 20px;
        }

        .antenna-right {
          animation: wiggle-right 0.6s ease-in-out infinite;
          transform-origin: 22px 20px;
        }

        @keyframes wiggle-left {
          0%,
          100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }

        @keyframes wiggle-right {
          0%,
          100% {
            transform: rotate(5deg);
          }
          50% {
            transform: rotate(-5deg);
          }
        }

        .tail-fan {
          animation: fan 0.4s ease-in-out infinite;
          transform-origin: 50px 28px;
        }

        @keyframes fan {
          0%,
          100% {
            transform: scaleX(1);
          }
          50% {
            transform: scaleX(1.2);
          }
        }

        .leg1 {
          animation: leg-move 0.4s ease-in-out infinite;
        }

        .leg2 {
          animation: leg-move 0.4s ease-in-out infinite 0.1s;
        }

        .leg3 {
          animation: leg-move 0.4s ease-in-out infinite 0.2s;
        }

        .leg4 {
          animation: leg-move 0.4s ease-in-out infinite 0.3s;
        }

        @keyframes leg-move {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        .claw-left {
          animation: claw-snap 1s ease-in-out infinite;
          transform-origin: 16px 30px;
        }

        .claw-right {
          animation: claw-snap 1s ease-in-out infinite 0.5s;
          transform-origin: 24px 30px;
        }

        @keyframes claw-snap {
          0%,
          90%,
          100% {
            transform: rotate(0deg);
          }
          95% {
            transform: rotate(-10deg);
          }
        }
      `}</style>
    </>
  );
}
