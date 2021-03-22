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

    return fetch(url, {method,headers,body}).then( res => {
        if( res.ok ) {
            return res.json();
        }
        throw new Error(`HTTP error! status: ${res.status}`); 
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