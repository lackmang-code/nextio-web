# 📋 작업 계획 및 협업 지침 (R&R) - 2섹션 콘텐츠 위탁제작 개편 (V2)

> ⚠️ **에이전트별 행동 제약 사항 (필독)**
> * **안티그라비티:** 기획서 작성 및 검수만 담당합니다. 소스 코드 직접 수정, 로컬 빌드/서버 구동, Git 배포 명령을 직접 실행하지 마십시오. (단, 조회 및 브라우저 검수용 명령은 수행 가능)
> * **클로드코드:** 본 계획서의 내용을 기반으로 실제 코딩, 로컬 빌드/테스트, Git 커밋 및 배포, 그리고 CLAUDE.md/rules.md 최종 편집을 전담하여 실행하십시오.

---

## 🎯 이번 작업 목표: 홈페이지 2섹션(콘텐츠 위탁제작) 디자인 전면 개편

대표님의 지시에 따라, 2섹션(`id="content-service"`)의 산만한 레이아웃과 이모지를 제거하고, 4페이지(Program 2, `id="research"`)의 다크 테마 프리미엄 디자인(`pg-unicorn`) 구조를 그대로 차용하여 개편합니다.

### 1. 기술적 구현 항목 (실행 및 빌드 - 클로드코드 담당)

* [ ] `01_Company/홈페이지/index.html` 파일 오픈.
* [ ] 기존 `<!-- ② 콘텐츠 위탁제작 -->` 주석 아래의 `<section id="content-service" class="pg cs-section">` 부터 `</section>` 까지의 전체 블록을 찾아 삭제.
* [ ] 삭제한 자리에 아래 제공된 **[새로운 마크업 코드]**를 정확히 붙여넣기.
* [ ] 로컬 개발 서버 실행 (`npx serve -p 3000 .`) 후 브라우저 확인. (스타일이 깨지는 곳은 없는지, 모바일 뷰어에서 텍스트가 잘리는지 점검)
* [ ] 수정을 성공적으로 마친 후, `git commit -m "콘텐츠 위탁제작 2섹션 V2 레이아웃 개편"` 및 `git push origin master` 실행.

### 2. [새로운 마크업 코드] (클로드코드 복붙용)

```html
<!-- ② 콘텐츠 위탁제작 -->
<section id="content-service" class="pg-unicorn">
  <div class="unicorn-header">
    <p class="unicorn-section-label">CONTENT AS A SERVICE</p>
  </div>
  <div class="two-col">
    <div class="col-text reveal">
      <p class="eyebrow" style="color:#7EB3F5">DIGITAL CONTENT AUTOMATION</p>
      <h2 class="sec-h" style="color:#fff; font-weight:700">AI가 기획부터 발행까지,<br>지식 콘텐츠의 자동화</h2>
      <p class="sec-body" style="color:#C8D8F0">B2B 기업과 학술 기관의 전문적인 콘텐츠를 AI 파이프라인으로 빠르고 정확하게 제작해 드립니다. 브랜딩부터 실제 발행까지의 모든 과정을 위탁해 보세요.</p>
      
      <div class="day-badges">
        <span class="db" style="background:#5B9BD5">Type 1<span>데일리 뉴스카드</span></span>
        <span class="db" style="background:#4CA86A">Type 2<span>학술 매거진</span></span>
        <span class="db" style="background:#E88A4A">Type 3<span>기관 뉴스레터</span></span>
        <span class="db" style="background:#9B82C8">Type 4<span>단행본 출판</span></span>
      </div>
      
      <div class="prog-list" style="margin-bottom:20px">
        <div class="prog-item" style="color:#C8D8F0"><span class="pm">✓</span> 기획, 요약, 디자인, 퍼블리싱 전 과정 AI 자동화</div>
        <div class="prog-item" style="color:#C8D8F0"><span class="pm">✓</span> 기업/연구실 맞춤형 브랜드 톤앤매너 적용</div>
        <div class="prog-item" style="color:#C8D8F0"><span class="pm">✓</span> 운영 리소스 90% 절감 효과</div>
      </div>

      <div class="cs-btns" style="margin-top:24px;">
        <a href="content-service.html" target="_blank" style="display:inline-block;background:#FBBF24;color:#1B2D6B;font-weight:700;font-size:.9rem;padding:11px 24px;border-radius:22px;text-decoration:none;margin-right:12px;">위탁제작 브로셔 보기 →</a>
        <a href="#contact" style="display:inline-block;color:#fff;font-weight:600;font-size:.9rem;padding:10px 22px;border-radius:22px;border:1.5px solid rgba(255,255,255,.4);text-decoration:none;">도입 문의</a>
      </div>
    </div>
    
    <div class="col-img reveal reveal-d2">
      <div class="unicorn-card">
        <p class="uc-tag">맞춤형 디지털 콘텐츠</p>
        <p class="uc-h">당신의 지식을<br>가장 빛나는<br>콘텐츠로</p>
        <p class="uc-sub">AI 파이프라인 구축<br>전담 AI 에이전트 할당</p>
        <div class="uc-meta">
          <span>매일 발행</span>
          <span>자동화 파이프라인</span>
          <span>운영 자동화</span>
        </div>
      </div>
    </div>
  </div>
</section>
```
