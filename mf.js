/**
 * @class MF
 * @author Md.Rajib-Ul-Islam<mdrajibul@gmail.com>
 * MF core utilities and functions.
 * @singleton
 *
 */
MF = {
    /**
     * The version of the MF Library
     * @type String
     */
    version: '1.0.1',
    versionDetail: {
        major: 1,
        minor: 0,
        patch: 1
    },
    /**
     * The baseurl for MF. This baseurl is used for whole project.
     * Usage:
     * this BASEURL is override in grails layout page cms.gsp
     * @type String
     */
    BASEURL: BASEURL,
    /**
     * The CMSURL is used for cms panel root url.
     * @type String
     */
    ADMINURL: this.BASEURL,
    /**
     * The RESOURCEPATH is used when need resource path location
     * @type String
     */
    RESOURCEPATH: this.BASEURL + 'upload/',
    /**
     * The IMAGEPATH is used when need applied theme image path location. by default this path produces images/webmascot/default/
     * Usage:
     * this IMAGEPATH is override in grails layout page cms.gsp
     * <script type="text/javascript">
     MF.IMAGEPATH = "<cms:imagePath />";
     </script>
     * @type String
     */
    IMAGEPATH: IMAGEPATH,
    /**
     * MF view namespace
     */
    view: {},
    /**
     * MF plugin namespace
     */
    plugin: {},
    /**
     * MF locale/language namespace
     */
    locale: {},
    /**
     * use for caching data store
     * @type Object
     */
    cachedContents: {}
};