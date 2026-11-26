import React from 'react';

/**
 * Official Bùi Quốc Châu 1983/2010 Standard Side Diagram (Đồ hình Trắc diện — Facing LEFT).
 * Clean pure 2D indigo (#2E2B7A) line-art on white background:
 * - No organ triangles or overlays
 * - Broadside anatomical BQC ear (arching up to line 3–4, sweeping helix root,
 *   concha/antihelix bowl, tragus bump & U-shaped intertragic notch at Huyệt 0, earlobe at Huyệt 14)
 * - Clean rear-ear (SAU TAI) reference inset at bottom right
 */
export const FaceIllustrationSide: React.FC = () => {
  const ink = '#2E2B7A';

  return (
    <g aria-label="Đồ hình Trắc diện Diện Chẩn Bùi Quốc Châu">
      <defs>
        <clipPath id="bqc-side-left-eye-clip">
          <path d="M236,486 C258,464 316,464 344,486 C318,504 260,504 236,486 Z" />
        </clipPath>
      </defs>

      {/* Pure white profile interior */}
      <path
        d="M278,196 C254,236 232,276 220,316 C214,344 214,362 216,374 C218,396 220,418 222,432 C230,452 238,472 234,486 C224,506 208,524 194,540 C176,562 160,580 148,596 C134,618 122,642 118,664 C116,674 122,682 128,684 C142,690 160,694 178,696 C182,708 182,718 180,726 C178,744 166,762 174,774 C180,782 192,788 202,790 C190,796 176,808 184,822 C192,836 208,846 216,858 C206,876 196,900 200,918 C208,942 262,960 342,956 C446,950 562,882 624,782 C642,748 644,712 638,684 L656,486 C656,340 520,176 278,196 Z"
        fill="#FFFFFF"
      />

      {/* ==================== FLOWING BQC TRẮC DIỆN HAIR WAVES (SWEEPING RIGHT) ==================== */}
      <g fill="none" stroke={ink} strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M236,222 C202,188 228,144 304,122 C412,92 558,74 714,82 C812,86 882,118 892,158 C898,184 854,202 802,200"
          strokeWidth="3.4"
        />
        <path
          d="M254,206 C244,174 282,154 366,144 C486,130 634,106 778,128 C846,138 898,162 938,184"
          strokeWidth="2.8"
        />
        <path
          d="M278,196 C332,208 408,226 492,216 C598,204 716,184 834,218 C886,232 924,254 944,274"
          strokeWidth="2.6"
        />
        <path
          d="M366,214 C446,246 544,264 646,256 C748,248 846,266 936,318"
          strokeWidth="2.4"
        />
        <path
          d="M412,226 C468,288 532,340 622,340 C726,340 832,324 942,368"
          strokeWidth="2.6"
        />
        <path
          d="M446,266 C484,332 542,374 628,374 C724,374 826,386 896,438"
          strokeWidth="2.4"
        />
        {/* Temple curls descending toward ear */}
        <path d="M444,292 C472,344 504,404 514,462 C520,492 508,518 498,530" strokeWidth="2.3" />
        <path d="M472,332 C502,384 534,436 558,484" strokeWidth="2.2" />
        <path d="M518,366 C552,408 584,454 598,494" strokeWidth="2.1" />
        {/* Hair curls flowing behind ear */}
        <path
          d="M754,394 C802,442 842,516 828,602 C816,668 766,704 726,694 C700,688 694,660 712,646"
          strokeWidth="2.5"
        />
        <path
          d="M792,404 C846,456 898,526 894,612 C892,678 854,704 824,690"
          strokeWidth="2.4"
        />
        <path
          d="M826,422 C882,468 936,528 930,606 C924,656 892,676 868,666"
          strokeWidth="2.2"
        />
      </g>

      {/* ==================== LEFT-FACING PROFILE & JAWLINE ==================== */}
      <g fill="none" stroke={ink} strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M278,196 C254,236 232,276 220,316 C214,344 214,362 216,374 C218,396 220,418 222,432 C230,452 238,472 234,486 C224,506 208,524 194,540 C176,562 160,580 148,596 C134,618 122,642 118,664 C116,674 122,682 128,684 C142,690 160,694 178,696 C182,708 182,718 180,726 C178,744 166,762 174,774 C180,782 192,788 202,790 C190,796 176,808 184,822 C192,836 208,846 216,858 C206,876 196,900 200,918 C208,942 262,960 342,956 C446,950 562,882 624,782 C642,748 644,712 638,684"
          strokeWidth="3"
        />
        <path d="M326,958 C388,956 446,964 494,984" strokeWidth="2.2" />
      </g>

      {/* ==================== SIDE FACIAL FEATURES (FACING LEFT) ==================== */}
      <g fill="none" stroke={ink} strokeLinecap="round" strokeLinejoin="round">
        {/* Solid indigo eyebrow (line 4) */}
        <path
          d="M222,434 C248,414 294,404 342,414 C362,418 378,426 386,434 C366,436 336,428 302,428 C268,428 242,434 222,434 Z"
          fill={ink}
          stroke="none"
        />

        {/* Pure line-art left-facing eye (line 5, y=486) */}
        <path d="M234,474 C262,456 322,458 352,478" strokeWidth="1.6" />
        <g clipPath="url(#bqc-side-left-eye-clip)">
          <ellipse cx="264" cy="486" rx="13" ry="22" fill="#FFFFFF" stroke={ink} strokeWidth="2.1" />
          <ellipse cx="261" cy="486" rx="5.5" ry="9.5" fill="#FFFFFF" stroke={ink} strokeWidth="1.9" />
        </g>
        <path d="M234,486 C258,464 318,464 346,486" strokeWidth="2.5" />
        <path d="M238,487 C262,504 316,504 342,486" strokeWidth="1.8" />
        <path d="M248,504 C278,514 318,512 340,498" strokeWidth="1.2" opacity="0.7" />

        {/* Nose wing, nostril & nasolabial fold */}
        <path d="M204,644 C224,650 226,680 206,690 C190,696 170,692 156,684" strokeWidth="2.1" />
        <path d="M196,680 C186,672 168,672 158,680" strokeWidth="2" />
        <path d="M240,596 C268,644 288,688 298,744" strokeWidth="1.9" />

        {/* Clean unshaded lips (line 10, y=790) */}
        <path d="M174,772 C202,774 238,780 266,790 C236,792 216,792 200,790" strokeWidth="1.9" />
        <path d="M266,790 C242,812 208,828 184,822" strokeWidth="1.9" />

        {/* ==================== AUTHENTIC BQC TRẮC DIỆN EAR (BROADSIDE) ==================== */}
        <g>
          {/* Broad outer ear contour rising above line 4 (y~392) down to full rounded earlobe at Huyệt 14 (638, 684) */}
          <path
            d="M632,486 C642,424 686,386 732,402 C774,418 788,484 776,556 C764,622 732,684 686,696 C660,702 644,696 638,684"
            fill="#FFFFFF"
            strokeWidth="2.8"
          />
          {/* Helix root (chân luân tai) sweeping from concha center up over the crest and down the outer rim */}
          <path
            d="M664,518 C662,462 688,414 724,424 C756,434 764,486 752,546 C744,584 728,618 710,636"
            strokeWidth="2.2"
          />
          {/* Antihelix & concha bowl curving smoothly down to antitragus */}
          <path
            d="M686,464 C716,462 732,494 724,540 C716,584 694,616 668,618 C656,618 650,612 648,604"
            strokeWidth="2"
          />
          {/* Subtle upper antihelix fork */}
          <path
            d="M712,488 C698,486 686,496 682,510"
            strokeWidth="1.6"
          />
          {/* Smooth tragus bump & U-shaped intertragic notch right at Huyệt 0 (638, 596) */}
          <path
            d="M636,532 C652,540 656,562 642,578 C634,586 634,598 644,606"
            fill="#FFFFFF"
            strokeWidth="2.2"
          />
        </g>
      </g>

      {/* ==================== REAR-EAR (SAU TAI) REFERENCE INSET ==================== */}
      <g transform="translate(866, 868) scale(0.92)" aria-label="Hình phụ vùng Sau Tai">
        <path
          d="M-12,-96 C26,-106 58,-72 60,-18 C62,36 46,90 22,120 C4,142 -22,140 -34,116 C-42,100 -42,74 -62,56 C-76,42 -78,12 -64,-12 C-52,-34 -34,-88 -12,-96 Z"
          fill="#FFFFFF"
          stroke={ink}
          strokeWidth="2.4"
        />
        <text x="0" y="-110" textAnchor="middle" fill={ink} fontSize="11" fontWeight="700">
          SAU TAI
        </text>
        <circle cx="-18" cy="126" r="3.2" fill="#1B6B46" />
        <text x="-30" y="128" textAnchor="end" fill="#1E293B" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">
          14
        </text>
      </g>
    </g>
  );
};
