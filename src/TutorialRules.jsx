import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCcw, Play, Pause, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

const BOARD_SIZE = 10;

// Static definition of all 4 tutorial pages outside the component to prevent re-creation
const PAGES = [
  {
    pageNumber: 1,
    title: "1. Any Number of Pieces Can Be Flipped",
    shortSummary: "Trap any number of continuous opponent pieces between your new piece and an existing piece to flip them all.",
    explanation: (
      <div className="tutorial-explanation-content">
        <p>
          If one or more opponent pieces are continuously trapped between <strong>your newly placed piece</strong> and an <strong>already-existing piece of your colour</strong>, all of those opponent pieces flip.
        </p>
        <p>
          This works in horizontal, vertical, and diagonal directions without any distance limit.
        </p>
        <div className="example-badge-box">
          <div className="example-line">
            <span className="example-label">Before:</span>
            <span className="token token-black">B</span>
            <span className="token token-white">W</span>
            <span className="token token-white">W</span>
            <span className="token token-white">W</span>
            <span className="token token-empty">[ ? ]</span>
          </div>
          <div className="example-arrow">➔</div>
          <div className="example-line">
            <span className="example-label">After Black plays:</span>
            <span className="token token-black">B</span>
            <span className="token token-black">B</span>
            <span className="token token-black">B</span>
            <span className="token token-black">B</span>
            <span className="token token-black">B</span>
          </div>
        </div>
        <div className="rule-note">
          <strong>Key Rule:</strong> Any number of opponent pieces may be between the two same-coloured pieces, as long as there is <em>no empty cell</em> between them.
        </div>
      </div>
    ),
    phaseCount: 5,
    phaseDurations: [1300, 1400, 1500, 1800, 2400],
    phaseLabels: [
      "1. Initial setup: Black at (4,2) and 3 White pieces",
      "2. Black places piece at (4,6) to complete the line",
      "3. Trap confirmed: 3 White pieces continuously bracketed",
      "4. Flipping: All 3 trapped White pieces flip to Black!",
      "5. Line complete: B B B B B"
    ],
    getBoardState: (p) => {
      const grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
      grid[4][2] = 'B';
      grid[4][3] = p >= 3 ? 'B' : 'W';
      grid[4][4] = p >= 3 ? 'B' : 'W';
      grid[4][5] = p >= 3 ? 'B' : 'W';
      if (p >= 1) grid[4][6] = 'B';
      return grid;
    },
    activeMove: { r: 4, c: 6, color: 'B' },
    renderVisualOverlays: (p) => {
      return (
        <>
          {p === 0 && (
            <g className="svg-target-indicator">
              <circle cx="65" cy="45" r="4.2" className="pulse-target" />
              <text x="65" y="45.8" className="target-text">PLAY</text>
            </g>
          )}
          {p >= 2 && (
            <g className="svg-capture-line">
              <defs>
                <marker id="arrow-cyan" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#66fcf1" />
                </marker>
              </defs>
              <line x1="26" y1="45" x2="63" y2="45" className="laser-line-cyan" markerEnd="url(#arrow-cyan)" />
              <rect x="31" y="41" width="28" height="8" rx="2" className="trapped-zone-bracket" />
            </g>
          )}
        </>
      );
    },
    badgeStatus: (p) => {
      if (p === 0) return { type: 'info', text: 'Black spots 3 continuous White pieces' };
      if (p === 1) return { type: 'highlight', text: 'New piece placed at (4, 6)' };
      if (p === 2) return { type: 'highlight', text: 'Trap closed: All 3 White pieces trapped!' };
      if (p === 3) return { type: 'success', text: 'Trapped pieces flip: White ➔ Black' };
      return { type: 'success', text: 'Line complete: B B B B B (3 captures)' };
    }
  },
  {
    pageNumber: 2,
    title: "2. No Chain Reaction",
    shortSummary: "Captures only happen from the newly placed piece. Flipped pieces cannot cause further captures.",
    explanation: (
      <div className="tutorial-explanation-content">
        <p>
          A capture happens <strong>only because of the newly placed piece</strong>.
        </p>
        <p>
          When opponent pieces are flipped, those newly flipped pieces <strong>CANNOT create another capture</strong>. In other words:
        </p>
        <div className="highlight-callout alert-accent">
          <strong>Flipped pieces do not trigger additional flips.</strong>
        </div>
        <p>
          If a newly flipped piece now forms a line with other existing pieces and traps an opponent piece, that second piece <strong>does NOT flip</strong>.
        </p>
        <div className="rule-note">
          <strong>Implementation Rule:</strong>
          <ol className="step-list">
            <li>1. Detect all captures caused directly by the newly placed piece.</li>
            <li>2. Flip those pieces.</li>
            <li>3. <strong>STOP.</strong> Do NOT run capture detection again using newly flipped pieces.</li>
          </ol>
        </div>
      </div>
    ),
    phaseCount: 6,
    phaseDurations: [1300, 1400, 1400, 1600, 2000, 2400],
    phaseLabels: [
      "1. Setup: Black targets cell (3,4) above White",
      "2. Black places new piece at (3,4)",
      "3. Valid direct capture: (4,4) White trapped vertically",
      "4. (4,4) flips to Black directly",
      "5. Checking horizontal row: Does (4,5) White flip?",
      "6. NO! Flipped pieces cannot trigger captures. (4,5) stays White!"
    ],
    getBoardState: (p) => {
      const grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
      grid[5][4] = 'B';
      grid[4][6] = 'B';
      grid[4][4] = p >= 3 ? 'B' : 'W';
      grid[4][5] = 'W'; // Always stays White!
      if (p >= 1) grid[3][4] = 'B';
      return grid;
    },
    activeMove: { r: 3, c: 4, color: 'B' },
    renderVisualOverlays: (p) => {
      return (
        <>
          {p === 0 && (
            <g className="svg-target-indicator">
              <circle cx="45" cy="35" r="4.2" className="pulse-target" />
              <text x="45" y="35.8" className="target-text">PLAY</text>
            </g>
          )}
          {p >= 2 && p <= 3 && (
            <g className="svg-direct-capture">
              <line x1="45" y1="36" x2="45" y2="53" className="laser-line-cyan" />
              <rect x="41" y="41" width="8" height="8" rx="2" className="trapped-zone-bracket" />
            </g>
          )}
          {p >= 4 && (
            <g className="svg-chain-blocked">
              <line x1="47" y1="45" x2="63" y2="45" className="laser-line-red" />
              <circle cx="55" cy="45" r="4.3" className="block-circle" />
              <line x1="53" y1="43" x2="57" y2="47" className="cross-line" />
              <line x1="57" y1="43" x2="53" y2="47" className="cross-line" />
            </g>
          )}
        </>
      );
    },
    badgeStatus: (p) => {
      if (p === 0) return { type: 'info', text: 'Black plans move at (3, 4)' };
      if (p === 1) return { type: 'highlight', text: 'New Black placed at (3, 4)' };
      if (p === 2) return { type: 'highlight', text: 'Direct capture: Vertical line (3,4) ➔ (5,4)' };
      if (p === 3) return { type: 'success', text: '(4, 4) flips to Black' };
      if (p === 4) return { type: 'warning', text: 'Checking horizontal row: Will (4, 5) flip?' };
      return { type: 'danger', text: '❌ NO CHAIN REACTION: (4, 5) White stays White!' };
    }
  },
  {
    pageNumber: 3,
    title: "3. Existing Traps Do Not Capture New Pieces",
    shortSummary: "A piece is flipped only when the opponent completes a trap. Placing inside an existing trap is completely safe.",
    explanation: (
      <div className="tutorial-explanation-content">
        <p>
          A piece is flipped only when the <strong>opponent places a new piece that completes the trap</strong>.
        </p>
        <p>
          If two opponent pieces already exist with an empty space between them, and you deliberately place your piece in that empty space, <strong>your newly placed piece does NOT get flipped</strong>.
        </p>
        <div className="example-badge-box">
          <div className="example-line">
            <span className="example-label">Existing Board:</span>
            <span className="token token-black">B</span>
            <span className="token token-empty">[ . ]</span>
            <span className="token token-black">B</span>
          </div>
          <div className="example-arrow">➔</div>
          <div className="example-line">
            <span className="example-label">White plays inside:</span>
            <span className="token token-black">B</span>
            <span className="token token-white">W</span>
            <span className="token token-black">B</span>
            <span className="safe-pill-tag">✓ Stays White</span>
          </div>
        </div>
        <div className="highlight-callout success-accent">
          <strong>The White piece stays White. It does NOT become Black!</strong>
        </div>
        <div className="rule-note">
          <strong>Why?</strong> Because the two Black pieces were already on the board. Black did not just place a new piece to complete the capture. <em>Only the newly placed piece can initiate a capture — you cannot capture yourself!</em>
        </div>
      </div>
    ),
    phaseCount: 5,
    phaseDurations: [1300, 1400, 1600, 2000, 2400],
    phaseLabels: [
      "1. Board setup: Existing Black pieces surround an empty cell: B . B",
      "2. White deliberately places piece in the middle: (4,4)",
      "3. Evaluating trap: Did Black complete this line?",
      "4. No! The trap already existed before this turn.",
      "5. The White piece remains safely White!"
    ],
    getBoardState: (p) => {
      const grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
      grid[4][3] = 'B';
      grid[4][5] = 'B';
      if (p >= 1) grid[4][4] = 'W'; // Stays White!
      return grid;
    },
    activeMove: { r: 4, c: 4, color: 'W' },
    renderVisualOverlays: (p) => {
      return (
        <>
          {p === 0 && (
            <g className="svg-target-indicator">
              <circle cx="45" cy="45" r="4.2" className="pulse-target-white" />
              <text x="45" y="45.8" className="target-text">GAP</text>
            </g>
          )}
          {p >= 2 && (
            <g className="svg-safe-shield">
              <rect x="40.5" y="40.5" width="9" height="9" rx="1.5" className="safe-shield-rect" />
              <circle cx="48" cy="42" r="1.8" fill="#4ade80" />
              <path d="M 47.2 42 L 47.8 42.6 L 48.8 41.4" stroke="#000" strokeWidth="0.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
        </>
      );
    },
    badgeStatus: (p) => {
      if (p === 0) return { type: 'info', text: 'Setup: Two existing Black pieces surround gap (4, 4)' };
      if (p === 1) return { type: 'highlight', text: 'White places piece inside: B - W - B' };
      if (p === 2) return { type: 'warning', text: 'Evaluating: Trap already existed, Black did not play' };
      if (p === 3) return { type: 'success', text: '🛡️ No Capture: Trap already existed!' };
      return { type: 'success', text: 'White piece remains White! 100% Safe Placement' };
    }
  },
  {
    pageNumber: 4,
    title: "4. One Move Can Flip in Multiple Directions",
    shortSummary: "A single move can simultaneously complete horizontal, vertical, and diagonal lines at once.",
    explanation: (
      <div className="tutorial-explanation-content">
        <p>
          A newly placed piece can complete multiple capture lines at the exact same time.
        </p>
        <p>
          The capture directions are checked independently (horizontal, vertical, diagonal).
        </p>
        <div className="diagram-box">
          <pre className="ascii-diagram">{`      B
       \\
        W
         \\
          B (New Move)
B —— W —— B`}</pre>
        </div>
        <p>
          When Black places the new piece at the intersection, <strong>both the horizontal and diagonal White pieces flip to Black</strong> in the same turn!
        </p>
        <div className="highlight-callout success-accent">
          <strong>“One move ➔ multiple directions ➔ multiple captures.”</strong>
        </div>
      </div>
    ),
    phaseCount: 5,
    phaseDurations: [1300, 1400, 1600, 1800, 2400],
    phaseLabels: [
      "1. Lines meet at empty intersection (4,4)",
      "2. Black plays at the intersection (4,4)",
      "3. Dual traps detected: horizontal + diagonal!",
      "4. Both White pieces flip to Black simultaneously!",
      "5. One move captures across multiple directions!"
    ],
    getBoardState: (p) => {
      const grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
      grid[2][2] = 'B';
      grid[4][2] = 'B';
      grid[3][3] = p >= 3 ? 'B' : 'W';
      grid[4][3] = p >= 3 ? 'B' : 'W';
      if (p >= 1) grid[4][4] = 'B';
      return grid;
    },
    activeMove: { r: 4, c: 4, color: 'B' },
    renderVisualOverlays: (p) => {
      return (
        <>
          {p === 0 && (
            <g className="svg-target-indicator">
              <circle cx="45" cy="45" r="4.2" className="pulse-target" />
              <text x="45" y="45.8" className="target-text">PLAY</text>
            </g>
          )}
          {p >= 2 && (
            <g className="svg-multi-capture">
              <defs>
                <marker id="arrow-multi" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#66fcf1" />
                </marker>
              </defs>
              <line x1="26" y1="45" x2="43" y2="45" className="laser-line-cyan" markerEnd="url(#arrow-multi)" />
              <line x1="26" y1="26" x2="43" y2="43" className="laser-line-cyan" markerEnd="url(#arrow-multi)" />
              <circle cx="35" cy="45" r="4.3" className="multi-bracket" />
              <circle cx="35" cy="35" r="4.3" className="multi-bracket" />
            </g>
          )}
        </>
      );
    },
    badgeStatus: (p) => {
      if (p === 0) return { type: 'info', text: 'Horizontal and diagonal lines share intersection (4, 4)' };
      if (p === 1) return { type: 'highlight', text: 'Black plays at the intersection (4, 4)' };
      if (p === 2) return { type: 'highlight', text: 'Dual traps triggered: Horizontal & Diagonal!' };
      if (p === 3) return { type: 'success', text: 'Both White pieces flip to Black!' };
      return { type: 'success', text: '“One move ➔ multiple directions ➔ multiple captures.”' };
    }
  }
];

export default function TutorialRules({ onClose, onStartPlaying }) {
  const [page, setPage] = useState(0);
  const [phase, setPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const currentPage = PAGES[page];

  // Reset phase when page changes
  useEffect(() => {
    setPhase(0);
    setIsPlaying(true);
  }, [page]);

  // Robust animation step timer
  useEffect(() => {
    if (!isPlaying) return;

    const currentDuration = currentPage.phaseDurations[phase] || 1600;
    const timer = setTimeout(() => {
      setPhase((prev) => (prev + 1) % currentPage.phaseCount);
    }, currentDuration);

    return () => clearTimeout(timer);
  }, [page, phase, isPlaying, currentPage.phaseDurations, currentPage.phaseCount]);

  const currentBoard = currentPage.getBoardState(phase);
  const currentBadge = currentPage.badgeStatus(phase);

  const handlePrev = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNext = () => {
    if (page < PAGES.length - 1) {
      setPage(page + 1);
    } else {
      onStartPlaying ? onStartPlaying() : onClose();
    }
  };

  const handleRestartPhase = () => {
    setPhase(0);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="rules-fullscreen-overlay" role="dialog" aria-modal="true">
      <div className="rules-tutorial-container">
        {/* Top Header */}
        <header className="tutorial-header">
          <div className="tutorial-header-left">
            <h1 className="tutorial-main-title">Eclipse Grid — How Captures Work</h1>
            <span className="tutorial-page-pill">Page {page + 1} of {PAGES.length}</span>
          </div>
          <button 
            className="tutorial-close-btn" 
            onClick={onClose}
            aria-label="Close Rules"
            title="Close Rules"
          >
            <X size={24} />
          </button>
        </header>

        {/* Main Content Area: Board Visualization + Explanation */}
        <div className="tutorial-body">
          {/* Board Visualization Section */}
          <div className="tutorial-board-section">
            <div className="tutorial-board-card">
              <div className="board-card-header">
                <div className={`status-pill pill-${currentBadge.type}`}>
                  {currentBadge.type === 'success' && <CheckCircle2 size={16} />}
                  {currentBadge.type === 'danger' && <XCircle size={16} />}
                  {currentBadge.type === 'warning' && <ShieldCheck size={16} />}
                  <span>{currentBadge.text}</span>
                </div>
                <div className="board-controls">
                  <button 
                    className="control-icon-btn" 
                    onClick={handleTogglePlay}
                    title={isPlaying ? "Pause animation" : "Resume animation"}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button 
                    className="control-icon-btn" 
                    onClick={handleRestartPhase}
                    title="Replay animation"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>

              {/* 10x10 Board with SVG Vector Overlay */}
              <div className="tutorial-board-wrapper">
                <div className="tutorial-board-grid">
                  {currentBoard.map((row, r) =>
                    row.map((cell, c) => {
                      const isNewMoveCell = 
                        phase >= 1 && 
                        currentPage.activeMove && 
                        currentPage.activeMove.r === r && 
                        currentPage.activeMove.c === c;

                      return (
                        <div 
                          key={`tut-${r}-${c}`} 
                          className={`tutorial-cell ${cell !== null ? 'has-piece' : ''} ${isNewMoveCell ? 'cell-new-move' : ''}`}
                          onClick={() => {
                            // If clicked while at setup phase on target cell, advance to place coin immediately
                            if (phase === 0 && currentPage.activeMove && currentPage.activeMove.r === r && currentPage.activeMove.c === c) {
                              setPhase(1);
                            }
                          }}
                        >
                          {cell !== null && (
                            <div className={`tutorial-piece-wrapper ${isNewMoveCell && phase === 1 ? 'piece-drop-anim' : ''}`}>
                              <div className={`piece-inner ${cell === 'B' ? 'is-black' : 'is-white'}`}>
                                <div className="piece-face face-black"></div>
                                <div className="piece-face face-white"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* SVG Visual Annotation Overlay */}
                <svg className="tutorial-board-svg-overlay" viewBox="0 0 100 100">
                  {currentPage.renderVisualOverlays(phase)}
                </svg>
              </div>

              {/* Animation Progress Stepper */}
              <div className="animation-stepper">
                <div className="stepper-track">
                  {currentPage.phaseLabels.map((label, idx) => (
                    <button
                      key={idx}
                      className={`step-segment ${idx === phase ? 'current' : idx < phase ? 'done' : ''}`}
                      onClick={() => {
                        setPhase(idx);
                        setIsPlaying(false);
                      }}
                      title={label}
                    />
                  ))}
                </div>
                <div className="stepper-label">{currentPage.phaseLabels[phase]}</div>
              </div>
            </div>
          </div>

          {/* Explanation Below Board */}
          <div className="tutorial-explanation-section">
            <h2 className="rule-page-title">{currentPage.title}</h2>
            <p className="rule-short-summary">{currentPage.shortSummary}</p>
            {currentPage.explanation}
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <footer className="tutorial-footer">
          <button 
            className="tutorial-nav-btn prev-btn" 
            onClick={handlePrev}
            disabled={page === 0}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className="tutorial-page-indicator">
            <span className="page-count-text">{page + 1} / {PAGES.length}</span>
            <div className="page-dots-list">
              {PAGES.map((_, i) => (
                <button
                  key={i}
                  className={`page-dot-item ${i === page ? 'active' : ''}`}
                  onClick={() => setPage(i)}
                  aria-label={`Go to Rule ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <button 
            className={`tutorial-nav-btn next-btn ${page === PAGES.length - 1 ? 'start-playing-btn' : ''}`}
            onClick={handleNext}
          >
            {page === PAGES.length - 1 ? (
              <>Start Playing <ChevronRight size={20} /></>
            ) : (
              <>Next <ChevronRight size={20} /></>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
