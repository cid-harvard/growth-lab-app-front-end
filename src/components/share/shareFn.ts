const getShareWindowParams =
  (width: number, height: number) =>
    `menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=${height},width=${width}`;

const getShareFunctions = (url: string) => {
  return {
    shareFacebook: () => {
      const baseURL = 'https://www.facebook.com/sharer.php';
      const shareURL = `${baseURL}?u=${encodeURIComponent(url)}`;
      window.open(shareURL, '', getShareWindowParams(360, 600));
    },

    shareTwitter: (text: string) => {
      const baseURL = 'https://twitter.com/intent/tweet';
      const shareURL =
`${baseURL}?
url=${encodeURIComponent(url)}&
text=${encodeURIComponent(text)}&
via=HarvardGrwthLab`;
      window.open(shareURL, '', getShareWindowParams(420, 550));
    },

    shareLinkedIn: (title: string, summary: string) => {
      // Reference:
      // https://developer.linkedin.com/docs/share-on-linkedin (under "customized URL")
      const baseURL = 'https://www.linkedin.com/shareArticle';
      // const source = 'https://atlas.cid.harvard.edu/';
      const source = encodeURIComponent(url);
      const shareURL =
`${baseURL}
?mini=true&
url=${encodeURIComponent(url)}&
title=${encodeURIComponent(title)}&
summary=${encodeURIComponent(summary)}&
source=${encodeURIComponent(source)}`;
      window.open(shareURL, '', getShareWindowParams(570, 520));
    },

    shareEmail: (subjectCopy: string, bodyBeforeLineBreakCopy: string, bodyAfterLineBreakCopy: string) => {
      const subject = encodeURIComponent(subjectCopy);
      const bodyBeforeLineBreak = encodeURIComponent(bodyBeforeLineBreakCopy);
      const bodyAfterLineBreak = encodeURIComponent(bodyAfterLineBreakCopy);

      const href = `mailto:?subject=${subject}&body=${bodyBeforeLineBreak}%0D%0A%0D%0A${bodyAfterLineBreak}`;

      window.location.href = href;
    },
  };
};

export default getShareFunctions;
