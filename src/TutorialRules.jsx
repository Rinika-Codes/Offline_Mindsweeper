import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCcw, Play, Pause, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

const BOARD_SIZE = 10;

export default function TutorialRules({ onClose, onStartPlaying }) {
  const [page, setPage] = useState(0);
  const [phase, setPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Each tutorial page defines phases, duration per phase, and board state
  const pages = [
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
      phaseDurations: [1800, 1600, 1600, 2000, 2500],
      phaseLabels: [
        "1. Initial setup: Black at (4,2) and 3 White pieces",
        "2. Black places piece at (4,6) to close the trap",
        "3. Highlighting line: All 3 White pieces are trapped!",
        "4. Flipping: All 3 trapped White pieces turn Black!",
        "5. Complete: All continuous trapped pieces are flipped"
      ],
      getBoardState: (p) => {
        // Cells on 10x10 board: row 4, cols 2..6
        // p = 0: (4,2): 'B', (4,3): 'W', (4,4): 'W', (4,5): 'W'
        // p = 1: (4,6) placed 'B'
        // p = 2: highlight line (4,2) -> (4,6)
        // p = 3: (4,3), (4,4), (4,5) flipping to 'B'
        // p = 4: fully flipped 'B'
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
        // Coordinates for SVG: viewBox 0 0 100 100
        // (r, c) -> x = (c + 0.5) * 10, y = (r + 0.5) * 10
        // (4, 2) is at x=25, y=45. (4, 6) is at x=65, y=45.
        return (
          <>
            {p === 0 && (
              <g className="svg-target-indicator">
                <circle cx="65" cy="45" r="4.2" className="pulse-target" />
                <text x="65" y="46.5" className="target-text">PLAY</text>
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
                {/* Trapped zone bracket */}
                <rect x="31" y="41" width="28" height="8" rx="2" className="trapped-zone-bracket" />
              </g>
            )}
          </>
        );
      },
      badgeStatus: (p) => {
        if (p === 0) return { type: 'info', text: 'Black spots 3 continuous White pieces' };
        if (p === 1) return { type: 'highlight', text: 'New piece placed at (Row 5, Col 7)' };
        if (p === 2) return { type: 'highlight', text: 'Continuous line closed: 3 White pieces trapped!' };
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
      phaseDurations: [1800, 1600, 1600, 1800, 2200, 2500],
      phaseLabels: [
        "1. Setup: Black prepares to place above (4,4) White",
        "2. Black places new piece at (3,4)",
        "3. Valid capture: (4,4) White is trapped vertically",
        "4. (4,4) flips to Black directly",
        "5. Checking row 4: Does (4,5) White flip?",
        "6. NO! Flipped pieces cannot trigger chain captures. (4,5) stays White!"
      ],
      getBoardState: (p) => {
        // Vertical: (3,4) new B, (4,4) W -> B (flips at p>=3), (5,4) existing B
        // Horizontal: (4,4) [B], (4,5) W (stays W!), (4,6) existing B
        const grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        grid[5][4] = 'B';
        grid[4][6] = 'B';
        grid[4][4] = p >= 3 ? 'B' : 'W';
        grid[4][5] = 'W'; // Stays White!
        if (p >= 1) grid[3][4] = 'B';
        return grid;
      },
      activeMove: { r: 3, c: 4, color: 'B' },
      renderVisualOverlays: (p) => {
        // (3,4) x=45, y=35. (4,4) x=45, y=45. (5,4) x=45, y=55.
        // (4,5) x=55, y=45. (4,6) x=65, y=45.
        return (
          <>
            {p === 0 && (
              <g className="svg-target-indicator">
                <circle cx="45" cy="35" r="4.2" className="pulse-target" />
                <text x="45" y="36.5" className="target-text">PLAY</text>
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
                {/* Horizontal potential line with red warning */}
                <line x1="47" y1="45" x2="63" y2="45" className="laser-line-red" />
                {/* Red cross on (4,5) */}
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
              <span className="token token-white">W (Safe)</span>
              <span className="token token-black">B</span>
            </div>
          </div>
          <div className="highlight-callout success-accent">
            <strong>The White piece stays White. It does NOT become Black!</strong>
          </div>
          <div className="rule-note">
            <strong>Why?</strong> Because the two Black pieces were already on the board. Black did not just place a new piece to complete the capture. <em>Only the newly placed piece can initiate a capture.</em>
          </div>
        </div>
      ),
      phaseCount: 5,
      phaseDurations: [1800, 1600, 1800, 2200, 2500],
      phaseLabels: [
        "1. Board state: Two existing Black pieces surround an empty cell: B . B",
        "2. White deliberately places piece in the middle: (4,4)",
        "3. Evaluating trap: Did Black complete this line?",
        "4. No! The trap already existed before this turn.",
        "5. The White piece remains safely White!"
      ],
      getBoardState: (p) => {
        // (4,3) B, (4,5) B
        // (4,4) White placed at p>=1, never flips to Black!
        const grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        grid[4][3] = 'B';
        grid[4][5] = 'B';
        if (p >= 1) grid[4][4] = 'W';
        return grid;
      },
      activeMove: { r: 4, c: 4, color: 'W' },
      renderVisualOverlays: (p) => {
        // (4,3) x=35, y=45. (4,4) x=45, y=45. (4,5) x=55, y=45.
        return (
          <>
            {p === 0 && (
              <g className="svg-target-indicator">
                <circle cx="45" cy="45" r="4.2" className="pulse-target-white" />
                <text x="45" y="46.5" className="target-text">GAP</text>
              </g>
            )}
            {p >= 2 && (
              <g className="svg-safe-shield">
                <circle cx="45" cy="45" r="4.5" className="safe-shield-circle" />
                <path d="M 43 45 L 44.5 46.5 L 47 43.5" className="safe-check" />
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
      phaseDurations: [1800, 1600, 1800, 2000, 2500],
      phaseLabels: [
        "1. Horizontal and diagonal lines meet at empty intersection (4,4)",
        "2. Black plays at the intersection (4,4)",
        "3. Trapping lines detected: horizontal + diagonal!",
        "4. Both White pieces flip to Black simultaneously!",
        "5. One move captures across multiple directions!"
      ],
      getBoardState: (p) => {
        // Intersection at (4,4)
        // Diagonal: (2,2) B, (3,3) W -> flips to B at p>=3
        // Horizontal: (4,2) B, (4,3) W -> flips to B at p>=3
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
        // (2,2) x=25, y=25. (3,3) x=35, y=35. (4,4) x=45, y=45.
        // (4,2) x=25, y=45. (4,3) x=35, y=45.
        return (
          <>
            {p === 0 && (
              <g className="svg-target-indicator">
                <circle cx="45" cy="45" r="4.2" className="pulse-target" />
                <text x="45" y="46.5" className="target-text">INTERSECT</text>
              </g>
            )}
            {p >= 2 && (
              <g className="svg-multi-capture">
                <defs>
                  <marker id="arrow-multi" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#66fcf1" />
                  </marker>
                </defs>
                {/* Horizontal laser */}
                <line x1="26" y1="45" x2="43" y2="45" className="laser-line-cyan" markerEnd="url(#arrow-multi)" />
                {/* Diagonal laser */}
                <line x1="26" y1="26" x2="43" y2="43" className="laser-line-cyan" markerEnd="url(#arrow-multi)" />
                {/* Brackets around captured pieces */}
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

  const currentPage = pages[page];

  // Timer loop for slow didactic animation
  useEffect(() => {
    setPhase(0);
  }, [page]);

  useEffect(() => {
    if (!isPlaying) return;

    const currentDuration = currentPage.phaseDurations[phase] || 2000;
    const timer = setTimeout(() => {
      setPhase((prev) => (prev + 1) % currentPage.phaseCount);
    }, currentDuration);

    return () => clearTimeout(timer);
  }, [page, phase, isPlaying, currentPage]);

  const currentBoard = currentPage.getBoardState(phase);
  const currentBadge = currentPage.badgeStatus(phase);

  const handlePrev = () => {
    if (page > 0) {
      setPage(page - 1);
      setPhase(0);
    }
  };

  const handleNext = () => {
    if (page < pages.length - 1) {
      setPage(page + 1);
      setPhase(0);
    } else {
      // Last page: Start Playing
      onStartPlaying ? onStartPlaying() : onClose();
    }
  };

  const handleRestartPhase = () => {
    setPhase(0);
  };

  return (
    <div className="rules-fullscreen-overlay" role="dialog" aria-modal="true">
      <div className="rules-tutorial-container">
        {/* Top Header */}
        <header className="tutorial-header">
          <div className="tutorial-header-left">
            <h1 className="tutorial-main-title">Grand Othello — How Captures Work</h1>
            <span className="tutorial-page-pill">Page {page + 1} of {pages.length}</span>
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
                    onClick={() => setIsPlaying(!isPlaying)}
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
                        >
                          {cell !== null && (
                            <div className="tutorial-piece-wrapper">
                              <div className={`piece-inner ${cell === 'B' ? 'is-black' : 'is-white'} ${isNewMoveCell ? 'piece-drop-anim' : ''}`}>
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
                      onClick={() => setPhase(idx)}
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
            <span className="page-count-text">{page + 1} / {pages.length}</span>
            <div className="page-dots-list">
              {pages.map((_, i) => (
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
            className={`tutorial-nav-btn next-btn ${page === pages.length - 1 ? 'start-playing-btn' : ''}`}
            onClick={handleNext}
          >
            {page === pages.length - 1 ? (
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
