const fs = require('fs');
const path = 'c:/Users/HP/Videos/Project/barber_apointment/frontend/src/components/layout/Navbar.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find the Dashboard link in the dropdown and add My Appointments after it
const marker = '                          </Link>\r\n                          <button\r\n                            onClick={handleLogout}';
const markerLF = '                          </Link>\n                          <button\n                            onClick={handleLogout}';

const insertion = `\r\n                          {user.role === 'CUSTOMER' && (\r\n                            <Link\r\n                              to="/my-appointments"\r\n                              onClick={() => setUserMenuOpen(false)}\r\n                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary rounded-sm transition-colors"\r\n                            >\r\n                              <CalendarDays size={16} />\r\n                              My Appointments\r\n                            </Link>\r\n                          )}`;

if (content.includes(marker)) {
  content = content.replace(
    marker,
    '                          </Link>' + insertion + '\r\n                          <button\r\n                            onClick={handleLogout}'
  );
  fs.writeFileSync(path, content, 'utf8');
  console.log('DONE (CRLF)');
} else if (content.includes(markerLF)) {
  content = content.replace(
    markerLF,
    '                          </Link>' + insertion.replace(/\r\n/g, '\n') + '\n                          <button\n                            onClick={handleLogout}'
  );
  fs.writeFileSync(path, content, 'utf8');
  console.log('DONE (LF)');
} else {
  console.log('MARKER NOT FOUND');
  // Print the area around logout for debugging
  const idx = content.indexOf('handleLogout}');
  console.log(JSON.stringify(content.substring(idx - 200, idx + 50)));
}
