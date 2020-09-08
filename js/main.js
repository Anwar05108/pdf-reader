const url = "./docs/bostan_saadi.pdf";

let pdfDoc = null,
  pageNum = 1,
  pageIsRendering = false,
  pageNumIsPending = null;

const scale = 1.5,
  canvas = document.querySelector("#pdf-render"),
  ctx = canvas.getContext("2d");

const renderPage = (num) => {
  pageIsRendering = true;

  pdfDoc.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderCtx = {
      canvasContext: ctx,
      viewport,
    };

    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false;

      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }
    });

    document.querySelector("#page-num").textContent = num;
  });
};

const queueRenderPage = (num) => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};

const showPrevPage = () => {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
};

const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
};

//Get Document
pdfjsLib
  .getDocument(url)
  .promise.then((pdfDoc_) => {
    pdfDoc = pdfDoc_;
    document.querySelector("#page-count").textContent = pdfDoc.numPages;
    renderPage(pageNum);
  })
  .catch((error) => {
    const div = document.createElement("div");
    div.className = "error";
    div.appendChild(document.createTextNode(error.message));
    document.querySelector("body").insertBefore(div, canvas);
    document.querySelector(".top-bar").style.display = "none";
  });

document.querySelector("#btn-prev").addEventListener("click", showPrevPage);
document.querySelector("#btn-next").addEventListener("click", showNextPage);
