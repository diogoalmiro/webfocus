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