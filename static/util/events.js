/**
 * Handle sumbit events on forms with a data-submit-cb defined
 */
window.addEventListener("submit", async e => {
    // e.target form submited
    // e.submitter button pressed to submit
    let form = e.target;
    if( form.disabled ){
        return;
    }
    let funName = form.dataset.submitCb;
    if( !funName ){
        return;
    }
    let fun = window[funName];
    if( !fun ){
        console.warn(`Form data-submit-cb is defined to ${funName}, however windows.${funName} is not defined.`);
    }
    form.disabled = true;
    e.preventDefault();

    const data = new FormData(form);
    const value = Object.fromEntries(data.entries());
    
    requestJSON(form.getAttribute("action"), form.getAttribute("method"), value)
        .then(value => {
            form.disabled = false;
            fun(value);
        });
})

/**
 * Setup pagination handlers
 */
window.addEventListener('load', () => {
    let currentPage = new URLSearchParams(window.location.search);
    
    let paginationElements = document.querySelectorAll("[data-pagination-url]")
    paginationElements.forEach(n => {
        let url = n.dataset.paginationUrl;
        
        let start = parseInt(n.dataset.paginationStart) || 0
        if( currentPage.has("start") ){
            start = parseInt(currentPage.get("start"));
        }
        let step = parseInt(n.dataset.paginationStep) || 20
        if( currentPage.has("end") ){
            step = parseInt(currentPage.get("end")) - start;
        }
        
        getJSON(`${url}?start=${start}&end=${start+step}`).then( ({pages, previous, next, error, length, start, end}) => {
            document.querySelectorAll("[data-pagination-error]").forEach( elem => elem.innerText = error )
            document.querySelectorAll("[data-pagination-length]").forEach( elem => elem.innerText = length )
            document.querySelectorAll("[data-pagination-start]").forEach( elem => elem.innerText = start )
            document.querySelectorAll("[data-pagination-end]").forEach( elem => elem.innerText = end )
            document.querySelectorAll("[data-pagination-previous]").forEach( a => {
                a.innerText = "Previous";
                a.href = previous
            });
            document.querySelectorAll("[data-pagination-next]").forEach( a => {
                a.innerText = "Next";
                a.href = next
            });
            let template = n.querySelector("template");
            pages.map(entry => {
                let templateInstance = document.importNode(template.content, true);
                templateInstance.querySelectorAll("[data-pagination-href]").forEach( a => a.href = a.dataset.paginationHref.replace(/#\{(.*)\}/, (_match, possibleName) => possibleName.length > 0 ? entry[possibleName] : entry.toString()))
                templateInstance.querySelectorAll("[data-pagination-value]").forEach( k => k.innerText = entry.toString())
                templateInstance.querySelectorAll("[data-pagination-map]").forEach( k => k.innerText = k.dataset.paginationMap.length == 0 ? entry.toString() : entry[k.dataset.paginationMap])
                
                let custom = new CustomEvent("PaginationAddedEntry", { detail: { element: templateInstance, data: entry} })
                window.dispatchEvent(custom)
                
                n.appendChild(templateInstance)
            })
        })
    })
})