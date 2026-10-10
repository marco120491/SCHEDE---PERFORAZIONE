/* PDF offline: pagine A4 rasterizzate, senza servizi o librerie esterne. */
function encodePDF(jpegs, width, height) {
 const enc=new TextEncoder(), chunks=[], offsets=[0]; let size=0;
 const append=x=>{const b=typeof x==='string'?enc.encode(x):x;chunks.push(b);size+=b.length;};
 const obj=(id,body)=>{offsets[id]=size;append(`${id} 0 obj\n`);append(body);append('\nendobj\n');};
 append('%PDF-1.4\n');
 obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
 obj(2,`<< /Type /Pages /Count ${jpegs.length} /Kids [${jpegs.map((_,i)=>`${3+i*3} 0 R`).join(' ')}] >>`);
 jpegs.forEach((bytes,i)=>{
  const id=3+i*3;
  obj(id,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Img ${id+2} 0 R >> >> /Contents ${id+1} 0 R >>`);
  const content='q\n595.28 0 0 841.89 0 0 cm\n/Img Do\nQ\n';
  obj(id+1,`<< /Length ${enc.encode(content).length} >>\nstream\n${content}endstream`);
  offsets[id+2]=size;append(`${id+2} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`);append(bytes);append('\nendstream\nendobj\n');
 });
 const xref=size;append(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
 for(let i=1;i<offsets.length;i++)append(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);
 append(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
 return new Blob(chunks,{type:'application/pdf'});
}
