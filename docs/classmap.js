YAHOO.env.classMap = {"Q.Js": "Q", "Q.Storage.Local": "Q", "Q.Sql.Read": "Q", "Q.Dom": "Q", "Q.Dom.Script": "Q", "Q.Storage.Session": "Q", "Q": "Q", "Q.Class": "Q", "Q.Ajax": "Q", "Q.Sql.Drop": "Q", "Q.Test": "Q", "Q.Worker": "Q", "Q.Storage": "Q", "Q.Sql": "Q", "Q.Db": "Q"};

YAHOO.env.resolveClass = function(className) {
    var a=className.split('.'), ns=YAHOO.env.classMap;

    for (var i=0; i<a.length; i=i+1) {
        if (ns[a[i]]) {
            ns = ns[a[i]];
        } else {
            return null;
        }
    }

    return ns;
};
