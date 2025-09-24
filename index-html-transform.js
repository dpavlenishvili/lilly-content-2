// eslint-disable-next-line no-undef
module.exports = (targetOptions, indexHtml) => {
  const i = indexHtml.indexOf('</body>');
  const buildTimestamp = `<script>buildTimestamp='${Date.now()}'</script>`;
  return `${indexHtml.slice(0, i)} ${buildTimestamp} ${indexHtml.slice(i)}`;
};
