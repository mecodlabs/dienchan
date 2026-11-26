import React from 'react';

/**
 * Official Bùi Quốc Châu 1983/2010 Standard Front Diagram (Đồ hình Chính diện).
 * Clean pure 2D indigo (#2E2B7A) line-art on white background:
 * - No organ triangles or overlays
 * - Accurate BQC ear silhouette (rising to line 3–4, clean helix/antihelix/tragus notch at Huyệt 0, earlobe at Huyệt 14)
 * - Unfilled concentric-ring eyes centered at G × 5 (356/644, 486)
 * - Classic bottom-right sub-nasal inset (173 – 143 – 19)
 */
export const FaceIllustrationFront: React.FC = () => {
  const ink = '#2E2B7A';

  return (
    <g aria-label="Đồ hình Chính diện Diện Chẩn Bùi Quốc Châu">
      <defs>
        <clipPath id="bqc-eye-right-clip">
          <path d="M284,486 C312,456 388,456 422,488 C392,510 316,510 284,486 Z" />
        </clipPath>
        <clipPath id="bqc-eye-left-clip">
          <path d="M716,486 C688,456 612,456 578,488 C608,510 684,510 716,486 Z" />
        </clipPath>
      </defs>

      {/* Pure white face interior */}
      <path
        d="M200,468 C196,365 212,248 262,202 C328,192 420,198 500,196 C580,198 672,192 738,202 C788,248 804,365 800,468 L784,664 C762,765 712,842 642,898 C592,938 546,954 500,954 C454,954 408,938 358,898 C288,842 238,765 216,664 Z"
        fill="#FFFFFF"
      />

      {/* ==================== AUTHENTIC BQC EARS (CHÍNH DIỆN) ==================== */}
      <g fill="none" stroke={ink} strokeLinecap="round" strokeLinejoin="round">
        {/* Patient's Right Ear (viewer left) */}
        {/* Outer ear contour rising smoothly above line 4 (y~382) down to rounded earlobe at Huyệt 14 (216, 664) */}
        <path
          d="M204,442 C188,392 146,374 126,408 C108,438 114,496 126,554 C136,602 146,646 164,672 C180,694 206,686 216,664"
          strokeWidth="2.8"
          fill="#FFFFFF"
        />
        {/* Inner helix rim following the upper-outer crest cleanly */}
        <path
          d="M196,446 C182,408 152,398 138,426 C126,450 132,498 144,548 C150,574 156,596 162,614"
          strokeWidth="2.2"
        />
        {/* Antihelix curve (đối luân tai) sweeping smoothly into the concha & antitragus */}
        <path
          d="M188,472 C164,462 150,486 156,524 C162,556 172,588 186,612 C194,624 206,624 210,614"
          strokeWidth="1.9"
        />
        {/* Upper antihelix crus branch */}
        <path
          d="M158,496 C168,488 180,490 190,502"
          strokeWidth="1.6"
        />
        {/* Clean tragus (bình tai) & intertragic notch right above Huyệt 0 (196, 596) */}
        <path
          d="M206,526 C194,536 192,554 202,566 C192,576 190,590 198,598"
          strokeWidth="2"
        />

        {/* Patient's Left Ear (viewer right — mirrored symmetrically) */}
        <path
          d="M796,442 C812,392 854,374 874,408 C892,438 886,496 874,554 C864,602 854,646 836,672 C820,694 794,686 784,664"
          strokeWidth="2.8"
          fill="#FFFFFF"
        />
        <path
          d="M804,446 C818,408 848,398 862,426 C874,450 868,498 856,548 C850,574 844,596 838,614"
          strokeWidth="2.2"
        />
        <path
          d="M812,472 C836,462 850,486 844,524 C838,556 828,588 814,612 C806,624 794,624 790,614"
          strokeWidth="1.9"
        />
        <path
          d="M842,496 C832,488 820,490 810,502"
          strokeWidth="1.6"
        />
        <path
          d="M794,526 C806,536 808,554 798,566 C808,576 810,590 802,598"
          strokeWidth="2"
        />
      </g>

      {/* ==================== SYMMETRICAL ROUNDED JAWLINE ==================== */}
      <path
        d="M216,664 C236,762 286,842 356,898 C408,938 454,954 500,954 C546,954 592,938 644,898 C714,842 764,762 784,664"
        fill="none"
        stroke={ink}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* ==================== ICONIC BQC SIDE-PARTED WAVY HAIR ==================== */}
      <g fill="none" stroke={ink} strokeLinecap="round" strokeLinejoin="round">
        {/* Left side-parted locks */}
        <path
          d="M278,132 C216,126 154,166 134,234 C118,288 128,354 114,386 C132,374 142,350 146,318"
          strokeWidth="3.2"
        />
        <path d="M274,152 C224,158 178,198 164,258 C152,312 146,368 140,398" strokeWidth="3" />
        <path d="M262,196 C224,226 196,286 184,358 C178,388 178,412 186,428" strokeWidth="2.8" />
        <path d="M226,252 C206,304 200,366 204,442" strokeWidth="2.4" />
        <path d="M228,192 C264,208 320,210 382,202 C432,196 468,188 500,196" strokeWidth="2.5" />

        {/* Right broad voluminous S-wave crown */}
        <path
          d="M278,132 C292,76 368,46 462,62 C558,78 652,66 716,96 C778,124 812,174 842,208"
          strokeWidth="3.4"
        />
        <path
          d="M292,116 C318,162 406,174 494,126 C572,84 656,78 718,122 C768,158 784,208 836,246"
          strokeWidth="3.2"
        />
        <path
          d="M348,186 C422,168 498,118 576,98 C646,80 712,114 736,168 C754,208 794,254 852,286"
          strokeWidth="2.8"
        />
        <path d="M438,194 C504,162 568,112 632,112 C686,112 706,162 676,196" strokeWidth="2.6" />
        <path d="M526,196 C578,172 624,132 664,138 C698,144 708,178 686,198" strokeWidth="2.4" />
        <path d="M604,198 C648,186 696,178 738,200 C786,226 828,284 856,336" strokeWidth="2.6" />
        <path d="M726,204 C766,246 802,302 842,354" strokeWidth="2.6" />
        <path d="M744,238 C778,288 806,348 824,398" strokeWidth="2.4" />
        <path d="M768,292 C794,342 800,392 796,442" strokeWidth="2.3" />
      </g>

      {/* ==================== EYEBROWS (SOLID INDIGO ARCHES ON LINE 4) ==================== */}
      <g fill={ink}>
        <path d="M446,432 C448,418 424,404 382,398 C334,392 278,402 228,440 C272,428 322,426 368,430 C408,434 438,438 446,432 Z" />
        <path d="M554,432 C552,418 576,404 618,398 C666,392 722,402 772,440 C728,428 678,426 632,430 C592,434 562,438 554,432 Z" />
      </g>

      {/* ==================== PURE LINE-ART EYES (CENTERED AT G × 5) ==================== */}
      <g fill="none" stroke={ink} strokeLinecap="round" strokeLinejoin="round">
        {/* Patient's Right Eye (viewer left) */}
        <g>
          <path d="M276,476 C312,446 388,446 426,482" strokeWidth="1.7" />
          <path
            d="M284,486 C312,456 388,456 422,488 C392,510 316,510 284,486 Z"
            fill="#FFFFFF"
            stroke="none"
          />
          <g clipPath="url(#bqc-eye-right-clip)">
            <circle cx="356" cy="484" r="28" fill="#FFFFFF" stroke={ink} strokeWidth="2.1" />
            <circle cx="356" cy="484" r="11" fill="#FFFFFF" stroke={ink} strokeWidth="1.9" />
          </g>
          <path d="M278,486 C310,454 388,454 424,488" strokeWidth="2.6" />
          <path d="M284,486 C316,510 390,510 422,488" strokeWidth="1.8" />
          <path d="M410,480 C414,486 414,492 408,495" strokeWidth="1.4" />
          <path d="M296,502 C328,518 382,518 412,500" strokeWidth="1.2" opacity="0.72" />
        </g>

        {/* Patient's Left Eye (viewer right) */}
        <g>
          <path d="M724,476 C688,446 612,446 574,482" strokeWidth="1.7" />
          <path
            d="M716,486 C688,456 612,456 578,488 C608,510 684,510 716,486 Z"
            fill="#FFFFFF"
            stroke="none"
          />
          <g clipPath="url(#bqc-eye-left-clip)">
            <circle cx="644" cy="484" r="28" fill="#FFFFFF" stroke={ink} strokeWidth="2.1" />
            <circle cx="644" cy="484" r="11" fill="#FFFFFF" stroke={ink} strokeWidth="1.9" />
          </g>
          <path d="M722,486 C690,454 612,454 576,488" strokeWidth="2.6" />
          <path d="M716,486 C684,510 610,510 578,488" strokeWidth="1.8" />
          <path d="M590,480 C586,486 586,492 592,495" strokeWidth="1.4" />
          <path d="M704,502 C672,518 618,518 588,500" strokeWidth="1.2" opacity="0.72" />
        </g>
      </g>

      {/* ==================== NOSE WINGS, NASOLABIAL FOLDS & PHILTRUM ==================== */}
      <g fill="none" stroke={ink} strokeLinecap="round" strokeLinejoin="round">
        <path d="M466,580 C456,606 446,624 440,636" strokeWidth="1.5" opacity="0.65" />
        <path d="M534,580 C544,606 554,624 560,636" strokeWidth="1.5" opacity="0.65" />
        <path
          d="M446,618 C428,634 426,668 446,680 C458,686 472,682 482,686 C492,692 508,692 518,686 C528,682 542,686 554,680 C574,668 572,634 554,618"
          strokeWidth="2.2"
        />
        <path d="M450,674 C458,664 476,666 484,678" strokeWidth="2" />
        <path d="M550,674 C542,664 524,666 516,678" strokeWidth="2" />
        <path d="M440,602 C406,642 384,686 368,744" strokeWidth="1.9" />
        <path d="M560,602 C594,642 616,686 632,744" strokeWidth="1.9" />
        <path d="M492,696 L484,764" strokeWidth="1.5" />
        <path d="M508,696 L516,764" strokeWidth="1.5" />
      </g>

      {/* ==================== CLEAN UNSHADED MOUTH & CHIN CREASE ==================== */}
      <g fill="none" stroke={ink} strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M392,790 C422,774 456,764 480,764 C490,764 496,769 500,769 C504,769 510,764 520,764 C544,764 578,774 608,790 C580,816 544,828 500,828 C456,828 420,816 392,790 Z"
          fill="#FFFFFF"
          strokeWidth="1.9"
        />
        <path d="M392,790 C432,793 468,792 500,791 C532,792 568,793 608,790" strokeWidth="2" />
        <path d="M416,882 C442,854 470,848 500,848 C530,848 558,854 584,882" strokeWidth="1.7" />
      </g>

      {/* ==================== CLASSIC BQC SUB-NASAL REFERENCE INSET ==================== */}
      <g transform="translate(874, 1004) scale(0.9)" aria-label="Hình phụ góc nhìn dưới chóp mũi (173 - 143 - 19)">
        <path
          d="M-58,42 C-46,4 -26,-32 0,-32 C26,-32 46,4 58,42"
          fill="#FFFFFF"
          stroke={ink}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M-38,40 C-34,12 -18,6 -8,14 L-8,42 M38,40 C34,12 18,6 8,14 L8,42"
          fill="none"
          stroke={ink}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="0" cy="-32" r="3.2" fill="#1B6B46" />
        <text x="0" y="-42" textAnchor="middle" fill="#1E293B" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">
          173
        </text>
        <circle cx="0" cy="10" r="3.2" fill="#C63131" />
        <text x="0" y="-1" textAnchor="middle" fill="#1E293B" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">
          143
        </text>
        <circle cx="0" cy="36" r="3.2" fill="#C63131" />
        <text x="0" y="26" textAnchor="middle" fill="#C63131" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">
          19
        </text>
      </g>
    </g>
  );
};
