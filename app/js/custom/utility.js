/**
 * RESIZE FUNCTION
 *
 * @param (callback function)
 * @return {string} A good string
 *
 * @example
 *
 *     resizeFunction(calculateWidth);
 */

const resizeFunction = (callBackFunction) => {
    return window.addEventListener('resize', callBackFunction);
};

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


/**
 * ON LOAD FUNCTION
 *
 * @param (callback function)
 * @return {string} A good string
 *
 * @example
 *     onloadFunction(calculateWidth);
 */
const onloadFunction = (callBackFunction) => {
    return window.addEventListener('load', callBackFunction);
};


/**
 * OPEN BLOCK
 *
 * @param (active to add active class, open to add active open)
 *
 *
 * @example
 *     openBlock('nav', 'nav-item');
 */
const openBlock = (active, open) => {
    let btnMenu = document.querySelector(`${active}`);
    let openBlock = document.querySelector(`${open}`);

    if (active && open) {

        btnMenu.addEventListener("click", (e) => {
            e.preventDefault();
            btnMenu.classList.toggle('active');
            openBlock.classList.toggle('open');
        })
    }
}

export {resizeFunction, onloadFunction, openBlock};