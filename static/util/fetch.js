function requestJSON(url, method, obj){
    
    let body = JSON.stringify(obj);
    if( method.match(/(get|head)/i) ){
        body = null
    }
    let headers = {
        'Accept-Language' : 'application/json'
    }
    if( body ){
        headers['Content-type'] = 'application/json'
        headers['Content-Lenght'] = body.length
    }

    return fetch(url, {method,headers,body}).then( res => res.json() )
}

function getJSON( url ){
    return requestJSON(url,'get')
}

function postJSON( url, obj ){
    return requestJSON(url, 'post', obj)
}

function postJSONmap(url,obj,map){
    return postJSON(url, obj).then( elems => elems.map(map) )
}

function getJSONmap(url, map){
    return getJSON(url).then(elems => elems.map(map))
}

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