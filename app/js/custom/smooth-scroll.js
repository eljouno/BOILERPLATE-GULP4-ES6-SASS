const scrollTo = () => {
    const links = document.querySelectorAll('.scroll-smooth');
    links.forEach(each => (each.onclick = scrollAnchors));
}

function scrollAnchors(e, respond = null) {
    let distanceToTop = el => Math.floor(el.getBoundingClientRect().top);
    e.preventDefault();

    let targetID = (respond) ? respond.getAttribute('href') : this.getAttribute('href');
    const targetAnchor = document.querySelector(targetID);

    if (!targetAnchor) return;

    let originalTop = distanceToTop(targetAnchor);

    window.scrollBy({ top: originalTop, left: 0, behavior: 'smooth' });
    let checkIfDone = setInterval(function() {
        let atBottom = window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 2;

        if (distanceToTop(targetAnchor) === 0 || atBottom) {
            targetAnchor.tabIndex = '-1';
            window.history.pushState('', '', targetID);
            clearInterval(checkIfDone);
        }
    }, 100);
}

scrollTo()