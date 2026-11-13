const installButton = document.querySelector('[data-install-app]');
const installDialog = document.querySelector('[data-install-help]');
const instructionText = document.querySelector('[data-install-instructions]');
let installPrompt = null;

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = /android/i.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).catch(error => {
      console.error('No se pudo registrar el service worker de Lumen Vitae:', error);
    });
  }, { once: true });
}

function showInstallButton() {
  if (installButton && !isStandalone) installButton.hidden = false;
}

function openInstallHelp() {
  if (!installDialog || !instructionText) return;
  if (isIOS) {
    instructionText.textContent = 'En Safari, toca Compartir y elige «Añadir a pantalla de inicio». Después, confirma con «Añadir».';
  } else if (isAndroid) {
    instructionText.textContent = 'Abre el menú ⋮ del navegador y elige «Instalar aplicación» o «Añadir a pantalla de inicio». Luego confirma la instalación.';
  } else {
    instructionText.textContent = 'Usa la opción «Instalar Lumen Vitae» del menú del navegador o el icono de instalación junto a la barra de direcciones.';
  }
  if (typeof installDialog.showModal === 'function') installDialog.showModal();
  else window.alert(instructionText.textContent);
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  showInstallButton();
});

window.addEventListener('appinstalled', () => {
  installPrompt = null;
  if (installButton) installButton.hidden = true;
});

if (!isStandalone && (isIOS || isAndroid)) showInstallButton();

installButton?.addEventListener('click', async () => {
  if (!installPrompt) return openInstallHelp();
  await installPrompt.prompt();
  const { outcome } = await installPrompt.userChoice;
  if (outcome === 'accepted' && installButton) installButton.hidden = true;
  installPrompt = null;
});

document.querySelectorAll('[data-install-close]').forEach(button => {
  button.addEventListener('click', () => installDialog?.close());
});

installDialog?.addEventListener('click', event => {
  if (event.target === installDialog) installDialog.close();
});
