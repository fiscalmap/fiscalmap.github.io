// DataTable 초기화 스크립트 (class 기반, SPA 안전)
(function() {
  // 페이지 네비게이션 이벤트 감지 (Quartz SPA)
  function initAllDataTables() {
    // datatable-container 클래스를 가진 모든 div 찾기
    const containers = document.querySelectorAll('.datatable-container:not([data-initialized])');
    
    if (containers.length === 0) {
      console.log('DataTable: 초기화할 새 테이블이 없습니다');
      return;
    }
    
    console.log('DataTable: ' + containers.length + '개 테이블 초기화 시작');
    
    // 각 컨테이너에 대해 테이블 생성
    containers.forEach(function(container) {
      // 초기화 중복 방지
      container.setAttribute('data-initialized', 'true');
      initDataTable(container);
    });
  }
  
  async function initDataTable(container) {
    const csvPath = container.dataset.src;
    
    if (!csvPath) {
      console.error('DataTable: data-src 속성이 없습니다');
      return;
    }
    
    console.log('DataTable: CSV 로딩 시작 -', csvPath);
    
    // CSV 파싱
    function parseCSV(text) {
      const lines = text.trim().split('\n');
      const result = [];
      
      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];
        const row = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const nextChar = line[i + 1];
          
          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            row.push(current);
            current = '';
          } else {
            current += char;
          }
        }
        row.push(current);
        result.push(row);
      }
      
      return result;
    }
    
    // 계층 레벨 감지
    function detectLevel(text) {
      let spaces = 0;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          spaces++;
        } else {
          break;
        }
      }
      if (spaces >= 8) return 3;
      if (spaces >= 6) return 2;
      if (spaces >= 4) return 1;
      return 0;
    }
    
    // 숫자 감지
    function isNumeric(value) {
      const cleaned = value.replace(/[,\s"]/g, '');
      return cleaned !== '' && cleaned !== '0' && !isNaN(cleaned);
    }
    
    // 숫자 포맷팅
    function formatNumber(value) {
      const cleaned = value.replace(/[,"]/g, '').trim();
      if (cleaned === '' || cleaned === '0') return value.trim();
      if (!isNumeric(value)) return value.trim();
      const num = parseFloat(cleaned);
      if (isNaN(num)) return value.trim();
      return num.toLocaleString('ko-KR');
    }
    
    try {
      const response = await fetch(csvPath);
      if (!response.ok) {
        throw new Error('CSV 파일을 불러올 수 없습니다: ' + response.status);
      }
      
      const csvText = await response.text();
      console.log('DataTable: CSV 로딩 완료 -', csvPath);
      
      const rows = parseCSV(csvText);
      console.log('DataTable: 파싱 완료 -', rows.length, '행');
      
      if (rows.length === 0) {
        throw new Error('CSV 파일이 비어있습니다');
      }
      
      // 첫 번째 컬럼이 ACNT_YR이면 제거, 아니면 유지
      let headers = rows[0];
      let dataRows = rows.slice(1);
      
      if (headers[0].trim().toUpperCase() === 'ACNT_YR') {
        headers = headers.slice(1);
        dataRows = dataRows.map(function(row) { return row.slice(1); });
      }
      
      // 파일명 추출
      const fileName = csvPath.split('/').pop();
      
      // 다운로드 버튼
      let html = '<div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd;">';
      html += '<div>';
      html += '<p style="margin: 0; font-size: 0.9rem; color: #666;">총 <strong>' + dataRows.length + '</strong>개 항목</p>';
      html += '</div>';
      html += '<a href="' + csvPath + '" download="' + fileName + '" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; transition: background 0.2s;" onmouseover="this.style.background=\'#2563eb\'" onmouseout="this.style.background=\'#3b82f6\'">';
      html += '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
      html += 'CSV 다운로드';
      html += '</a>';
      html += '</div>';
      
      // 테이블 생성
      html += '<div style="overflow-x:auto;border:1px solid #ddd;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.05);"><table style="width:100%;border-collapse:collapse;font-size:0.9rem;min-width:800px;"><thead style="background:#f8f9fa;position:sticky;top:0;z-index:10;"><tr>';
      
      // 헤더
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i].trim();
        const align = i === 0 ? 'left' : 'center';
        html += '<th style="padding:12px 16px;text-align:' + align + ';font-weight:600;border-bottom:2px solid #ddd;white-space:nowrap;">' + header + '</th>';
      }
      
      html += '</tr></thead><tbody>';
      
      // 데이터 행
      for (let i = 0; i < dataRows.length; i++) {
        const rowData = dataRows[i];
        const categoryText = rowData[0];
        const level = detectLevel(categoryText);
        
        const fontWeight = level === 0 ? '700' : level === 1 ? '600' : '400';
        const fontSize = level === 0 ? '1rem' : level === 1 ? '0.95rem' : level === 2 ? '0.9rem' : '0.85rem';
        const bgColor = level === 0 ? 'rgba(59,130,246,0.08)' : level === 1 ? 'rgba(59,130,246,0.04)' : '';
        const textColor = level === 0 ? '#1e40af' : level === 1 ? '#3b82f6' : '#374151';
        
        html += '<tr style="background:' + bgColor + ';border-bottom:1px solid #eee;font-weight:' + fontWeight + ';font-size:' + fontSize + ';" onmouseover="this.style.background=\'rgba(59,130,246,0.1)\'" onmouseout="this.style.background=\'' + bgColor + '\'">';
        
        for (let j = 0; j < rowData.length; j++) {
          const cell = rowData[j];
          
          if (j === 0) {
            const paddingLeft = (level * 2) + 'rem';
            const cleanText = cell.trim();
            
            let icon = '';
            if (level === 0 || level === 1) {
              icon = '<span style="margin-right:8px;color:#3b82f6;font-size:0.75rem;">▼</span>';
            }
            
            html += '<td style="padding:10px 16px;padding-left:' + paddingLeft + ';text-align:left;color:' + textColor + ';">' + icon + cleanText + '</td>';
          } else {
            const value = formatNumber(cell);
            const fontFamily = isNumeric(cell) ? 'Monaco, Consolas, monospace' : 'inherit';
            html += '<td style="padding:10px 16px;text-align:right;font-family:' + fontFamily + ';">' + value + '</td>';
          }
        }
        
        html += '</tr>';
      }
      
      html += '</tbody></table></div>';
      
      container.innerHTML = html;
      console.log('DataTable: 렌더링 완료 -', csvPath);
      
    } catch (error) {
      console.error('DataTable 오류:', csvPath, error);
      container.innerHTML = '<div style="padding:2rem;text-align:center;color:#666;border:1px solid #ddd;border-radius:8px;margin:2rem 0;">⚠️ 데이터를 불러올 수 없습니다: ' + error.message + '</div>';
    }
  }
  
  // 초기 로드 및 페이지 전환 시 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllDataTables);
  } else {
    initAllDataTables();
  }
  
  // Quartz SPA 네비게이션 이벤트 감지
  document.addEventListener('nav', function() {
    console.log('DataTable: 페이지 전환 감지');
    // 약간의 지연을 두고 초기화 (DOM 업데이트 대기)
    setTimeout(initAllDataTables, 100);
  });
})();
