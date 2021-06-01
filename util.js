class InvalidParameters extends Error {
    constructor(str){
        super("Invalid Parameters: "+str)
    }
}
/**
 * Creates a middleware router to handle pagination requests over a list
 * @param {*} listGetter function that returns the list
 * @param {*} filter function to filter specific elements
 * @param {*} map function to map specific elements
 * @returns {(express.Request, express.Response, express.Next) => void} Middleware handle
 *          Request is expectedd to have in the query a value for start and end
 */
module.exports.pagination = (listGetterPromise, filter=() => true, map=a => a, step=20) => {
    return async (req, res, next) => {
        let errors = []
        let error = 400;
        // Requets parameters
        let qstart = parseInt(req.query.start) || 0
        if( qstart < 0 ){
            errors.push(`"start" must be greater or equal to zero. start=${qstart}`)
            qstart = 0;
        }
        let qend = parseInt(req.query.end) || (qstart + step)
        if( qstart >= qend ){
            errors.push(`"start" must be smaller than "end". start=${qstart} end=${qend}`)
            qstart = 0;
            qend = qstart + step
        }

        let list = (await listGetterPromise().catch(e => {errors.push(e.message); error=500; return []})).filter(filter);
        if( qend > list.length ){
            errors.push(`"end" must be smaller than list length. end=${qend} length=${list.length}`)
            qend = list.length
            qstart = Math.min(qstart, qend);
        } 

        step = qend - qstart;

        let pstart = qstart - step;
        if( pstart < 0 ) pstart = 0;
        let pend = pstart + step;
        let previousQuery = `?start=${pstart}&end=${pend}`;

        let nstart = qend;
        if( nstart >= list.length || nstart + step > list.length ) nstart = list.length - step;
        let nend = nstart + step;
        let nextQuery = `?start=${nstart}&end=${nend}`;

        res.status(errors.lentgh > 0 ? error:200).json({
            pages : await Promise.all(list.slice(qstart, qend).map(map)),
            start: qstart,
            end: qend,
            previous : previousQuery,
            next : nextQuery,
            length : list.length,
            errors
        })
    }
}
