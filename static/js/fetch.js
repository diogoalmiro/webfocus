/**
 * Makes an HTTP request to a given url (uses fecth internally)
 * The obj is stringified and putting in the HTTP body, except when HEAD and GET requests.
 * This method sets 'Accept-Language' and 'Content-Type' to 'application/json'.
 * 
 * If wrapError is true this method will check for HTTP response before returning the json body.
 * In case of error it will throw a new Error with the HTTP status text as message and the response object.
 * 
 * @param {*} url 
 * @param {*} method 
 * @param {*} obj 
 * @param {*} wrapError 
 */
function requestJSON(url, method, obj, wrapError=false){
    
    let body = JSON.stringify(obj);
    if( method.match(/(get|head)/i) ){
        body = null
    }
    let headers = {
        'Accept-Language' : 'application/json'
    }
    if( body ){
        headers['Content-Type'] = 'application/json'
        headers['Content-Lenght'] = body.length
    }

    return fetch(url, {method,headers,body}).then( res => {
        if( !wrapError ) return res.json();
        if( res.ok ) return res.json();

        let e = new Error(res.statusText);
        e.response = res;
        throw e;
    })
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

function loadScript(expectedGlobal, url, cb){
    const SCRIPT_ID = expectedGlobal+'-load-script';
    if( window[expectedGlobal] == null ){
        let script = document.getElementById(SCRIPT_ID);
        if( script == null ){
            script = document.createElement("script");
            script.id = SCRIPT_ID;
            script.src = url;
            script.fired = false;
            script.addEventListener("load", () => {
                script.fired = true;
                cb();
            })
        }
        else if(!script.fired){
            script.addEventListener("load", () => {
                script.fired = true;
                cb();
            })
        }
        else{
            cb();
        }
    } 

}
