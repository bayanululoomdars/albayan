const fs = require('fs');
const path = require('path');

const dir = 'public';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const mudarrisHtml = `
          <div class="col-lg-5 col-md-12 footer-mudarris">
            <h4>Mudarris</h4>
            <p style="margin-bottom: 8px;"><strong>Principal Mudarris:</strong><br><span style="color:#d4af37; font-weight:600; font-size:1.1rem;">Sheikhuna Ibrahim Baqavi Al Haithami</span></p>
            <p><strong>Assistant Mudarris:</strong><br><span style="color:#e0e0e0; font-size:0.95rem; line-height:1.6; display:inline-block; margin-top:4px;">Usthad Mansoor Faizy, Usthad Musthafa Baqavi, Usthad Jahfar Jalali, Usthad Abdulla Faizy, Usthad Shameem Jalali, Usthad Rashid Baqavi, Usthad Shan Baqavi</span></p>
          </div>
`;

files.forEach(file => {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  
  // Replace footer-links and footer-newsletter
  let newContent = content.replace(/<div class="col-lg-2 col-md-6 footer-links">[\s\S]*?<\/ul>\s*<\/div>/g, '');
  
  // Also check if index.html has an empty footer-newsletter with id elements and replace it
  newContent = newContent.replace(/<div class="col-lg-3 col-md-6 footer-newsletter">[\s\S]*?<\/div>/g, mudarrisHtml.trim());
  
  if (content !== newContent) {
    fs.writeFileSync(path.join(dir, file), newContent);
    console.log('Updated ' + file);
  }
});
