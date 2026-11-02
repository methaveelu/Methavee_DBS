//https://demo.page.dev/?scenario=error&delay=1000 sample test url

const PARAMS_LIST = ['scenario', 'delay'];

export function withDemoParams(
    path:string,
    pageSearch:string = window.location.search
):string{

    const [pathname, query] = path.split('?');
    const apiParams = new URLSearchParams(query);
    const pageParams = new URLSearchParams(pageSearch);

    for(const param of PARAMS_LIST){
        const value = pageParams.get(param);
        if(value) apiParams.set(param, value);
    }
    const search = apiParams.toString(); 
    console.log('search_param_test', search)
    return search? `${pathname}?${search}`: pathname;
}