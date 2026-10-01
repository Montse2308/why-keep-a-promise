/**
 * The notebook panel's script (ADR 0024, ADR 0025): it turns the fallback link into the button that
 * opens the native modal <dialog>. The browser keeps the focus inside the open dialog and closes it
 * on Esc; this script also closes it from its button and from a click on the backdrop, and always
 * gives the focus back to the button, so a keyboard picks up where it left. Without JavaScript, or
 * where <dialog> is missing, the link to the footer's list stays.
 */
export function mount(root: Document = document): void {
  const dialog = root.querySelector<HTMLDialogElement>('dialog[data-notebook]');
  const button = root.querySelector<HTMLButtonElement>('[data-notebook-open]');
  const link = root.querySelector<HTMLAnchorElement>('[data-notebook-link]');
  if (!dialog || !button || typeof dialog.showModal !== 'function') return;

  button.hidden = false;
  if (link) link.hidden = true;

  button.addEventListener('click', () => {
    if (dialog.open) return;
    dialog.showModal();
    button.setAttribute('aria-expanded', 'true');
  });

  // Esc, the close button and the backdrop all end here.
  dialog.addEventListener('close', () => {
    button.setAttribute('aria-expanded', 'false');
    button.focus();
  });

  dialog.querySelector('[data-notebook-close]')?.addEventListener('click', () => dialog.close());

  // The sheet fills the dialog, so a click that lands on the dialog itself is on its backdrop.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}
