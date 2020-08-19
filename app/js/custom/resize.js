const resizeFunction = (callBackFunction) => {
    return window.addEventListener('resize', callBackFunction);
};
export default resizeFunction;

/*
use function with paramater in callback

const bckImgText = (imgClass, textClass) => {
    console.log(imgClass);
    console.log(textClass);
    let img = document.querySelector(`${imgClass}`);
    let text = document.querySelector(`${textClass}`);

if (img && text) {
    if (window.matchMedia("(min-width: 768px)").matches) {
        let heightImg = img.offsetHeight;
        console.log(heightImg);
        text.style = `min-height:${heightImg}px;`;
    }
}

resizeFunction(bckImgText.bind(this, '.c-offer-pres-glob__img', '.c-offer-pres-glob__content'));*/
