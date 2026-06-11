export const GTM_CONTAINER_ID = "GTM-T7CDXNCC";

const defaultEscapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getGtmId = (tracking = {}) => {
  if (tracking.trackingEnabled === false) return "";
  return tracking.gtmId || GTM_CONTAINER_ID;
};

export const getTrackingConfig = (tracking = {}) => ({
  ...tracking,
  gtmId: GTM_CONTAINER_ID,
  trackingEnabled: true,
});

export const renderGtmHead = (tracking = {}, escapeHtml = defaultEscapeHtml) => {
  const gtmId = getGtmId(tracking);
  if (!gtmId) return "";
  return `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${escapeHtml(gtmId)}');</script>
<!-- End Google Tag Manager -->`;
};

export const renderGtmBody = (tracking = {}, escapeHtml = defaultEscapeHtml) => {
  const gtmId = getGtmId(tracking);
  if (!gtmId) return "";
  return `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${escapeHtml(gtmId)}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;
};
