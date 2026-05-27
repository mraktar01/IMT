/* ============================================================
   IMT — Admin JavaScript  v4
   • Firebase Auth (email/password) for login
   • Full CRUD: gallery, posts, contacts, settings
   • Section toggles + quick-toggle buttons
   • Cloudinary image upload
   ============================================================ */
'use strict';

// ══════════════════════════════════════════════════════════════
// CLOUDINARY CONFIG  (your real values)
// ══════════════════════════════════════════════════════════════
const CLOUDINARY = {
  cloudName:    'dqmcrf8pv',
  uploadPreset: 'imt-web'
};

const SESSION_KEY = 'imt_admin_auth';

// ══════════════════════════════════════════════════════════════
// AUTH — Firebase Email / Password
// ══════════════════════════════════════════════════════════════

function checkSession() {
  // Firebase Auth persists across refreshes automatically.
  // We check window._imt_auth once Firebase module is ready.
  const check = setInterval(() => {
    if (window._imt_auth) {
      clearInterval(check);
      window._imt_auth.onAuthStateChanged(window._imt_auth.authInstance, user => {
        if (user) showDashboard();
        // else stay on login page
      });
    }
  }, 100);
  setTimeout(() => clearInterval(check), 8000);
}

window.doLogin = async function () {
  const email  = document.getElementById('login-email').value.trim();
  const pass   = document.getElementById('login-pass').value;
  const errEl  = document.getElementById('login-error');
  const btn    = document.getElementById('login-btn');
  errEl.classList.remove('show');
  if (!email || !pass) { errEl.textContent='Please enter email and password.'; errEl.classList.add('show'); return; }

  btn.disabled = true; btn.textContent = 'Signing in…';

  try {
    await window._imt_auth.signIn(email, pass);
    // onAuthStateChanged fires → showDashboard()
  } catch (e) {
    let msg = 'Login failed. Check email and password.';
    if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential')
      msg = 'Invalid email or password.';
    else if (e.code === 'auth/too-many-requests')
      msg = 'Too many failed attempts. Try again later.';
    errEl.textContent = msg;
    errEl.classList.add('show');
    btn.disabled = false; btn.textContent = 'Sign In →';
  }
};

window.doLogout = async function () {
  await window._imt_auth.signOut();
  document.getElementById('dashboard').classList.remove('active');
  document.getElementById('login-page').style.display = 'flex';
};

['login-email','login-pass'].forEach(id => {
  document.getElementById(id)?.addEventListener('keydown', e => { if (e.key==='Enter') doLogin(); });
});

function showDashboard() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('dashboard').classList.add('active');
  const check = setInterval(() => {
    if (typeof window.firebaseReady === 'function') { clearInterval(check); window.firebaseReady(); }
  }, 100);
  setTimeout(() => clearInterval(check), 8000);
}

checkSession();

// ══════════════════════════════════════════════════════════════
// PANEL NAVIGATION
// ══════════════════════════════════════════════════════════════

const PANEL_TITLES = {
  overview:'Dashboard', announcement:'Announcement Bar',
  gallery:'Gallery / Moments', posts:'Posts & Blogs',
  sections:'Section Visibility', contacts:'Contact Submissions',
  legal:'Privacy & Terms'
};

window.showPanel = function (id) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  document.getElementById(`panel-${id}`)?.classList.add('active');
  document.querySelector(`.sidebar-item[data-panel="${id}"]`)?.classList.add('active');
  document.getElementById('page-title').textContent = PANEL_TITLES[id] || id;
  if (window.innerWidth < 768) closeSidebar();
};

window.toggleSidebar = function () {
  const s=document.getElementById('sidebar'), o=document.getElementById('sidebar-overlay');
  const open=s.classList.contains('open');
  s.classList.toggle('open',!open); o.classList.toggle('show',!open);
};
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('show');
}

// ══════════════════════════════════════════════════════════════
// CLOUDINARY UPLOAD
// ══════════════════════════════════════════════════════════════

window.previewImage = function (input, previewId) {
  const p=document.getElementById(previewId);
  if (input.files?.[0]) {
    const r=new FileReader();
    r.onload=e=>{p.src=e.target.result;p.style.display='block';};
    r.readAsDataURL(input.files[0]);
  }
};

async function uploadToCloudinary(file) {
  if (!file) return null;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY.uploadPreset);
  fd.append('folder', 'imt-website');
  try {
    const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/image/upload`,{method:'POST',body:fd});
    const data = await res.json();
    if (data.secure_url) return data.secure_url;
    throw new Error(data.error?.message || 'Upload failed');
  } catch(e) { showAdminToast(`Upload error: ${e.message}`,'error'); return null; }
}

// ══════════════════════════════════════════════════════════════
// FIREBASE HELPERS
// ══════════════════════════════════════════════════════════════

function getDb() { return window._fs?.db() || null; }

async function fsGet(col, orderField=null) {
  const db=getDb(); if (!db) return [];
  const {collection,getDocs,query,orderBy}=window._fs;
  try {
    const q = orderField ? query(collection(db,col),orderBy(orderField,'desc')) : collection(db,col);
    const s = await getDocs(q);
    return s.docs.map(d=>({id:d.id,...d.data()}));
  } catch(e){console.error('fsGet',e);return [];}
}
async function fsAdd(col,data) {
  const db=getDb(); if (!db){showAdminToast('Firebase not connected.','error');return null;}
  const {collection,addDoc}=window._fs;
  return addDoc(collection(db,col),{...data,createdAt:new Date()});
}
async function fsUpdate(col,docId,data) {
  const db=getDb(); if (!db) return;
  const {doc,updateDoc}=window._fs;
  return updateDoc(doc(db,col,docId),data);
}
async function fsDelete(col,docId) {
  const db=getDb(); if (!db) return;
  const {doc,deleteDoc}=window._fs;
  return deleteDoc(doc(db,col,docId));
}
async function getSettingsDoc() { const items=await fsGet('settings'); return items[0]||null; }
async function saveSettings(patch) {
  const existing=await getSettingsDoc();
  if (existing) await fsUpdate('settings',existing.id,{...patch,updatedAt:new Date()});
  else          await fsAdd('settings',patch);
}

// ══════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ══════════════════════════════════════════════════════════════

window.loadDashboardStats = async function () {
  const [gal,posts,contacts,settings]=await Promise.all([
    fsGet('gallery'),fsGet('posts'),fsGet('contacts'),fsGet('settings')
  ]);
  const s=settings[0]||{};
  document.getElementById('stat-gallery').textContent  = gal.length;
  document.getElementById('stat-posts').textContent    = posts.length;
  document.getElementById('stat-contacts').textContent = contacts.length;
  document.getElementById('stat-ann').textContent      = s.announcementEnabled ? '🟢 On' : '🔴 Off';
  const gb=document.getElementById('badge-gallery-status');
  const pb=document.getElementById('badge-posts-status');
  if (gb) gb.textContent = s.galleryEnabled!==false ? '🟢 Visible':'🔴 Hidden';
  if (pb) pb.textContent = s.postsEnabled!==false   ? '🟢 Visible':'🔴 Hidden';
};

// ══════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════

window.loadSettings = async function () {
  const s=(await getSettingsDoc())||{};
  // Announcement
  document.getElementById('ann-enabled').checked    = !!s.announcementEnabled;
  document.getElementById('ann-text-input').value   = s.announcementText     || '';
  document.getElementById('ann-cta-text').value     = s.announcementCta      || '';
  document.getElementById('ann-url').value          = s.announcementUrl      || '';
  document.getElementById('ann-color').value        = s.announcementColor    || '#0a1628';
  document.getElementById('ann-text-color').value   = s.announcementTextColor|| '#ffffff';
  document.querySelectorAll('.color-swatch[data-color]').forEach(sw=>
    sw.classList.toggle('selected', sw.dataset.color===(s.announcementColor||'#0a1628')));
  document.querySelectorAll('.color-swatch[data-tc]').forEach(sw=>
    sw.classList.toggle('selected', sw.dataset.tc===(s.announcementTextColor||'#ffffff')));
  // Section visibility
  setToggle('vis-announcement', s.announcementEnabled!==false);
  setToggle('vis-gallery',      s.galleryEnabled     !==false);
  setToggle('vis-posts',        s.postsEnabled       !==false);
  updateToggleLabel('vis-announcement');
  updateToggleLabel('vis-gallery');
  updateToggleLabel('vis-posts');
};

function setToggle(id,val){ const el=document.getElementById(id); if(el) el.checked=!!val; }

window.updateToggleLabel = function(cbId) {
  const cb=document.getElementById(cbId);
  const lbl=document.getElementById(`label-${cbId}`);
  if (!cb||!lbl) return;
  lbl.textContent = cb.checked ? '🟢 Visible on site' : '🔴 Hidden from site';
  lbl.style.color = cb.checked ? 'var(--success)' : 'var(--danger)';
};

window.saveAnnouncement = async function() {
  const on=document.getElementById('ann-enabled').checked;
  await saveSettings({
    announcementEnabled:   on,
    announcementText:      document.getElementById('ann-text-input').value.trim(),
    announcementCta:       document.getElementById('ann-cta-text').value.trim(),
    announcementUrl:       document.getElementById('ann-url').value.trim(),
    announcementColor:     document.getElementById('ann-color').value,
    announcementTextColor: document.getElementById('ann-text-color').value
  });
  setToggle('vis-announcement',on); updateToggleLabel('vis-announcement');
  showAdminToast('✅ Announcement saved! Refresh public site to see changes.','success');
  loadDashboardStats();
};

window.saveSectionSettings = async function() {
  const annOn=document.getElementById('vis-announcement').checked;
  const galOn=document.getElementById('vis-gallery').checked;
  const posOn=document.getElementById('vis-posts').checked;
  await saveSettings({announcementEnabled:annOn, galleryEnabled:galOn, postsEnabled:posOn});
  setToggle('ann-enabled',annOn);
  showAdminToast('✅ Section visibility saved!','success');
  loadDashboardStats();
};

window.quickToggleSection = async function(section) {
  const cbId   = `vis-${section}`;
  const field  = section==='gallery' ? 'galleryEnabled' : 'postsEnabled';
  const cur    = (await getSettingsDoc())||{};
  const newVal = !(cur[field]!==false);
  await saveSettings({[field]:newVal});
  setToggle(cbId,newVal); updateToggleLabel(cbId);
  const btn=document.getElementById(`quickbtn-${section}`);
  if (btn) btn.textContent = newVal
    ? `🔴 Hide ${section==='gallery'?'Gallery':'Posts'} Section`
    : `🟢 Show ${section==='gallery'?'Gallery':'Posts'} Section`;
  showAdminToast(`${newVal?'🟢':'🔴'} ${section==='gallery'?'Gallery':'Posts'} section is now ${newVal?'visible':'hidden'}.`, newVal?'success':'error');
  loadDashboardStats();
};

window.selectColor       = el => { document.querySelectorAll('.color-swatch[data-color]').forEach(s=>s.classList.remove('selected')); el.classList.add('selected'); document.getElementById('ann-color').value=el.dataset.color; };
window.selectCustomColor = c  => { document.querySelectorAll('.color-swatch[data-color]').forEach(s=>s.classList.remove('selected')); document.getElementById('ann-color').value=c; };
window.selectTextColor   = el => { document.querySelectorAll('.color-swatch[data-tc]').forEach(s=>s.classList.remove('selected')); el.classList.add('selected'); document.getElementById('ann-text-color').value=el.dataset.tc; };

// ══════════════════════════════════════════════════════════════
// GALLERY
// ══════════════════════════════════════════════════════════════

window.loadGalleryTable = async function() {
  const items=await fsGet('gallery','uploadDate');
  const tbody=document.getElementById('gallery-table-body');
  document.getElementById('gal-count').textContent=`${items.length} item${items.length!==1?'s':''}`;
  const s=(await getSettingsDoc())||{};
  const btn=document.getElementById('quickbtn-gallery');
  if (btn) btn.textContent=s.galleryEnabled!==false?'🔴 Hide Gallery Section':'🟢 Show Gallery Section';
  if (!items.length){tbody.innerHTML='<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-light)">No gallery images yet.</td></tr>';return;}
  tbody.innerHTML=items.map(i=>`
    <tr>
      <td><img class="table-thumb" src="${esc(i.imageUrl||'')}" alt="${esc(i.title||'')}" onerror="this.style.display='none'" /></td>
      <td style="font-weight:500">${esc(i.title||'Untitled')}</td>
      <td style="white-space:nowrap;font-size:.8rem;color:var(--text-light)">${esc(i.uploadDate||'—')}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteGalleryImage('${i.id}')">🗑 Delete</button></td>
    </tr>`).join('');
};

window.addGalleryImage = async function() {
  const title=document.getElementById('gal-title').value.trim();
  const date =document.getElementById('gal-date').value;
  const fi   =document.getElementById('gal-file');
  if (!title){showAdminToast('Please enter a title.','error');return;}
  if (!fi.files[0]){showAdminToast('Please select an image.','error');return;}
  const btn=document.querySelector('[onclick="addGalleryImage()"]');
  if (btn){btn.disabled=true;btn.textContent='⏳ Uploading…';}
  const url=await uploadToCloudinary(fi.files[0]);
  if (btn){btn.disabled=false;btn.textContent='➕ Add to Gallery';}
  if (!url) return;
  await fsAdd('gallery',{title,uploadDate:date,imageUrl:url});
  showAdminToast('✅ Image added!','success');
  document.getElementById('gal-title').value='';
  document.getElementById('gal-date').value=new Date().toISOString().slice(0,10);
  fi.value='';
  const p=document.getElementById('gal-preview');p.style.display='none';p.src='';
  loadGalleryTable(); loadDashboardStats();
};

window.deleteGalleryImage = async function(id) {
  if (!confirm('Delete this image? Cannot be undone.')) return;
  await fsDelete('gallery',id);
  showAdminToast('Image deleted.','success');
  loadGalleryTable(); loadDashboardStats();
};

// ══════════════════════════════════════════════════════════════
// POSTS
// ══════════════════════════════════════════════════════════════

const TYPE_L={event:'🎪 Event',blog:'✍️ Blog',announce:'📢 Announcement'};
const TYPE_C={event:'badge-event',blog:'badge-blog',announce:'badge-announce'};

window.loadPostsTable = async function() {
  const items=await fsGet('posts','createdAt');
  const tbody=document.getElementById('posts-table-body');
  document.getElementById('posts-count').textContent=`${items.length} post${items.length!==1?'s':''}`;
  const s=(await getSettingsDoc())||{};
  const btn=document.getElementById('quickbtn-posts');
  if (btn) btn.textContent=s.postsEnabled!==false?'🔴 Hide Posts Section':'🟢 Show Posts Section';
  if (!items.length){tbody.innerHTML='<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-light)">No posts yet.</td></tr>';return;}
  tbody.innerHTML=items.map(i=>`
    <tr>
      <td><span class="table-badge ${TYPE_C[i.type]||'badge-blog'}">${TYPE_L[i.type]||'✍️ Blog'}</span></td>
      <td style="font-weight:500">${esc(i.title||'Untitled')}</td>
      <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text-light);font-size:.82rem">${esc(i.preview||i.content?.slice(0,80)||'')}</td>
      <td style="white-space:nowrap">
        <button class="btn btn-sm btn-outline-admin" style="margin-right:6px" onclick='editPost(${JSON.stringify(i).replace(/'/g,"&#39;")})'>✏️ Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deletePost('${i.id}')">🗑</button>
      </td>
    </tr>`).join('');
};

window.savePost = async function() {
  const id=document.getElementById('edit-post-id').value;
  const type=document.getElementById('post-type').value;
  const title=document.getElementById('post-title').value.trim();
  const preview=document.getElementById('post-preview').value.trim();
  const content=document.getElementById('post-content').value.trim();
  const fi=document.getElementById('post-file');
  const existing=document.getElementById('post-existing-img').value;
  if (!title){showAdminToast('Please enter a title.','error');return;}
  if (!content){showAdminToast('Please enter content.','error');return;}
  const btn=document.querySelector('[onclick="savePost()"]');
  if (btn){btn.disabled=true;btn.textContent='⏳ Saving…';}
  let imageUrl=existing;
  if (fi.files[0]) imageUrl=await uploadToCloudinary(fi.files[0])||existing;
  const data={type,title,preview,content,imageUrl};
  if (id) { await fsUpdate('posts',id,{...data,updatedAt:new Date()}); showAdminToast('✅ Post updated!','success'); }
  else    { await fsAdd('posts',data); showAdminToast('✅ Post published!','success'); }
  if (btn){btn.disabled=false;btn.textContent='💾 Publish Post';}
  resetPostForm(); loadPostsTable(); loadDashboardStats();
};

window.editPost = function(item) {
  document.getElementById('edit-post-id').value      = item.id;
  document.getElementById('post-type').value         = item.type    ||'blog';
  document.getElementById('post-title').value        = item.title   ||'';
  document.getElementById('post-preview').value      = item.preview ||'';
  document.getElementById('post-content').value      = item.content ||'';
  document.getElementById('post-existing-img').value = item.imageUrl||'';
  document.getElementById('post-form-heading').textContent='✏️ Edit Post';
  const sb=document.querySelector('[onclick="savePost()"]');
  if (sb) sb.textContent='💾 Update Post';
  if (item.imageUrl){const p=document.getElementById('post-img-preview');p.src=item.imageUrl;p.style.display='block';}
  window.scrollTo({top:0,behavior:'smooth'});
};

window.resetPostForm = function() {
  ['edit-post-id','post-existing-img'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  ['post-title','post-preview','post-content'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  document.getElementById('post-type').value='blog';
  document.getElementById('post-form-heading').textContent='Create New Post';
  const sb=document.querySelector('[onclick="savePost()"]');if(sb)sb.textContent='💾 Publish Post';
  const p=document.getElementById('post-img-preview');p.style.display='none';p.src='';
  document.getElementById('post-file').value='';
};

window.deletePost = async function(id) {
  if (!confirm('Delete this post?')) return;
  await fsDelete('posts',id);
  showAdminToast('Post deleted.','success');
  loadPostsTable(); loadDashboardStats();
};

// ══════════════════════════════════════════════════════════════
// LEGAL CONTENT
// ══════════════════════════════════════════════════════════════

window.loadLegalContent = async function() {
  const db=getDb(); if (!db) return;
  const {collection,getDocs}=window._fs;
  try {
    const snap=await getDocs(collection(db,'legal'));
    snap.forEach(doc=>{
      const d=doc.data();
      const type=doc.id; // 'privacy' or 'terms'
      const titleEl=document.getElementById(`${type}-title`);
      const dateEl =document.getElementById(`${type}-date`);
      const htmlEl =document.getElementById(`${type}-html`);
      if (titleEl && d.title)         titleEl.value=d.title;
      if (dateEl  && d.effectiveDate) dateEl.value =d.effectiveDate;
      if (htmlEl  && d.html)          htmlEl.value =d.html;
    });
  } catch(e){console.error('Load legal:',e);}
};

window.saveLegal = async function(type) {
  const db=getDb(); if (!db){showAdminToast('Firebase not connected.','error');return;}
  const {doc,setDoc}=window._fs;
  const title=document.getElementById(`${type}-title`)?.value.trim();
  const effectiveDate=document.getElementById(`${type}-date`)?.value.trim();
  const html=document.getElementById(`${type}-html`)?.value.trim();
  if (!html){showAdminToast('Please enter content.','error');return;}
  try {
    await setDoc(doc(getDb(),'legal',type),{title,effectiveDate,html,updatedAt:new Date()});
    showAdminToast(`✅ ${type==='privacy'?'Privacy Policy':'Terms & Conditions'} saved! Public site will update on next visitor load.`,'success');
  } catch(e){showAdminToast(`Save error: ${e.message}`,'error');}
};

// ══════════════════════════════════════════════════════════════
// CONTACTS
// ══════════════════════════════════════════════════════════════

window.loadContactsTable = async function() {
  const items=await fsGet('contacts','createdAt');
  const tbody=document.getElementById('contacts-table-body');
  document.getElementById('contacts-count').textContent=`${items.length} message${items.length!==1?'s':''}`;
  if (!items.length){tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-light)">No messages yet.</td></tr>';return;}
  tbody.innerHTML=items.map(i=>{
    const date=i.createdAt?.toDate?i.createdAt.toDate().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'';
    return`<tr>
      <td style="font-weight:500">${esc(i.name||'')} <br><span style="font-size:.72rem;color:var(--text-light)">${esc(date)}</span></td>
      <td><a href="mailto:${esc(i.email||'')}" style="color:var(--accent-dark)">${esc(i.email||'')}</a></td>
      <td>${esc(i.subject||'')}</td>
      <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text-mid);font-size:.82rem">${esc(i.message||'')}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteContact('${i.id}')">🗑</button></td>
    </tr>`;}).join('');
};

window.deleteContact = async function(id) {
  if (!confirm('Delete this message?')) return;
  await fsDelete('contacts',id);
  showAdminToast('Message deleted.','success');
  loadContactsTable(); loadDashboardStats();
};

// ══════════════════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════════════════

function esc(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}

window.showAdminToast = function(msg,type='success'){
  const t=document.getElementById('admin-toast');
  t.textContent=msg;t.className=`show ${type}`;
  clearTimeout(t._t);t._t=setTimeout(()=>{t.className='';},4000);
};

const gd=document.getElementById('gal-date');if(gd) gd.value=new Date().toISOString().slice(0,10);
