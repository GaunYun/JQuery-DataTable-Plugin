/**
 * @summary         DataTables
 * @description    Paginate, search and sort, resize column, add & remove column HTML tables
 * @version         0.0
 * @file            jquery.sib.datatable.js
 * @author          Gaun
 * @contact         gaun@sendinblue.com
 */
(function($){

    $.sibdatatable = function(el, options) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var debug_method = true;
        var base = this;
        var totalDatas = [];
        var curDatas = [];
        var curPageNumber = 0;
        var curPageLimit = 25;
        var curOrder = 'asc';
        var curOrderby = null;
        var totalCount = 0;
        var curCount = 0;
        var viewColumns = [];

        // Log function.
        function debug(e) {
            if(debug_method == true) {
                console.log(e);
            }
        }

        // Check options, and set variables.
        function checkOptions() {
            totalDatas = [];
            curDatas = [];
            curPageLimit = base.options.pagingLimit;
            curPageNumber = 0;
            curOrder = base.options.order;
            curOrderby = base.options.orderBy;
            viewColumns = base.options.Columns;
        }

        // Get the date of a table form remote source.
        function getTableDataFromRemote() {

            var remote_url = base.options.dataSource;
            if(remote_url == null) {
                return false;
            }
            remote_url += '?';
            remote_url = remote_url + base.options.remoteParamsIn.pageNumber + '=' + curPageNumber + '&';
            remote_url = remote_url + base.options.remoteParamsIn.pagingLimit + '=' + curPageLimit + '&';
            remote_url = remote_url + base.options.remoteParamsIn.order + '=' + curOrder + '&';
            remote_url = remote_url + base.options.remoteParamsIn.orderBy + '=' + curOrderby;
            debug(remote_url);

            if(base.options.remoteParamsIn.getMethod == 'get') {
                $.get(remote_url,null,function(respond, status) {
                    debug('response from remote server');
                    var respondJson = $.parseJSON(respond);
                    totalCount = parseInt(respondJson.total_count);
                    curCount = parseInt(respondJson.get_count);
                    curDatas = respondJson.contacts;
                    renderTable();
                });
            }

            if(base.options.remoteParamsIn.getMethod == 'post') {
                $.post(remote_url,null,function(respond, status) {
                    debug('response from remote server');
                    var respondJson = $.parseJSON(respond);
                    totalCount = parseInt(respondJson.total_count);
                    curCount = parseInt(respondJson.get_count);
                    curDatas = respondJson.contacts;
                    renderTable();
                });
            }
        }

        // Get the date of a table form remote source.
        function getTableDataFromHtml() {

        }

        // Get the date of a table form remote source.
        function getTableDataFromJSON() {

        }

        // Get the data of a table from data source.
        function refreshTable() {
            debug(base.options.dataSourceType);
            $(base.$el_body.find('.sibdatatable-spin')).show();
            base.$el_body_content.hide();
            switch (base.options.dataSourceType) {
                case 'remote':
                    getTableDataFromRemote();
                    break;
                case 'html':
                    getTableDataFromHtml();
                    break;
                case 'json':
                    getTableDataFromJSON();
                    break;
            }
        }

        // Render table.
        function renderTable() {
            debug('render table');
            debug(curDatas);
            var index = 0;
            var index1 = 0;
            base.$el_header.show();
            base.$el_footer.show();
            // Refresh navi section.
            var cur_first_index = curPageNumber * curPageLimit + 1;
            var cur_last_index = cur_first_index + curCount;
            if(isFirstPage()) {
                $(base.$el.find('.sibdatatable-navi-prev')).hide();
            }
            else {
                $(base.$el.find('.sibdatatable-navi-prev')).show();
            }
            if(isLastPage()) {
                $(base.$el.find('.sibdatatable-navi-next')).hide();
            }
            else {
                $(base.$el.find('.sibdatatable-navi-next')).show();
            }
            var navi_content = ' ' + cur_first_index + ' ~ ' + cur_last_index + ' of ' + totalCount + ' ';
            $(base.$el.find('.sibdatatable-navi-title')).text(navi_content);
            $(base.$el.find('.sibdatatable-navi-title')).show();

            // Display columns.
            base.$el_body_content.empty();
            var content_html = '<tr>';
            var column_class = '';
            content_html += '<td class="col-head row-head row-select" role="columnheader"><input type="checkbox"></td>';
            for(index = 0; index < viewColumns.length; index++) {
                if(index == 0) {
                    column_class = 'col-head row-head sortable ';
                }
                else {
                    column_class = 'col-head sortable ';
                }
                if(curOrderby == viewColumns[index].fields) {
                    column_class += 'sorted ';
                    if(curOrder == 'asc') {
                        content_html += '<td class="'+ column_class+'" role="columnheader" data-sort-val="'+ viewColumns[index]['fields'] +'">'+ viewColumns[index]['title'] + ' <i class="fa fa-sort-asc"></i> </td>';
                    }
                    else {
                        content_html += '<td class="'+ column_class+'" role="columnheader" data-sort-val="'+ viewColumns[index]['fields'] +'">'+ viewColumns[index]['title'] + ' <i class="fa fa-sort-desc"></i> </td>';
                    }
                }
                else {
                    content_html += '<td class="'+ column_class+'" role="columnheader" data-sort-val="'+ viewColumns[index]['fields'] +'">'+ viewColumns[index]['title'] + '</td>';
                }
            }
            content_html += '</tr>';

            // Display table content.
            var element_class = '';
            for(index = 0; index < curDatas.length; index++) {
                content_html += '<tr>';
                content_html += '<td class="row-head profile-select"><input type="checkbox"></td>';
                for(index1 = 0; index1 < viewColumns.length; index1++) {
                    if(index1 == 0) {
                        element_class = 'row-head';
                    }
                    else {
                        element_class = '';
                    }
                    content_html += '<td class="' + element_class + '" title="' + curDatas[index][viewColumns[index1]['fields']] + '">' + curDatas[index][viewColumns[index1]['fields']] + '</td>';
                }
                content_html += '</tr>';
            }

            base.$el_body_content.append(content_html);
            base.$el_body_content.find('td.sortable').bind("click", function() {
                onClickChangeSort(this);
            });

            $(base.$el_body.find('.sibdatatable-spin')).hide();
            base.$el_body_content.show();
        }

        // Make the template of table.
        function makeTemplateTable() {
            debug('make template of table');
            base.$el.empty();
            base.$el.addClass('sib-datatable');

            if(base.$el.find('.sibdatatable-header').length <= 0) {
                base.$el.append('<div class="sibdatatable-header sibdatatable-inner"  style="display: none;"></div>');
                base.$el_header = $(base.$el.find('.sibdatatable-header')[0]);
                base.el_header = base.$el.find('.sibdatatable-header')[0];
                base.$el_header.append('<div class="sibdatatable-navi"><span class="sibdatatable-navi-prev" style="display: none;"><i class="fa fa-angle-left fa-lg"></i></span><span class="sibdatatable-navi-title"  style="display: none;"></span><span class="sibdatatable-navi-next"  style="display: none;"><i class="fa fa-angle-right fa-lg"></i></span></div>');
                base.$el_header.find('.sibdatatable-navi-prev').bind("click", function() {
                    onClickNaviPrev(this);
                });
                base.$el_header.find('.sibdatatable-navi-next').bind("click", function() {
                    onClickNaviNext(this);
                });
            }
            if(base.$el.find('.sibdatatable-body').length <= 0) {
                base.$el.append('<div class="sibdatatable-body sibdatatable-inner"></div>');
                base.$el_body = $(base.$el.find('.sibdatatable-body')[0]);
                base.el_body = base.$el.find('.sibdatatable-body')[0];
                base.$el_body.append('<div class="sibdatatable-spin"><i class="fa fa-spinner fa-spin fa-lg"></i></div>');
                base.$el_body.append('<table class="table-contents"></table>');
                base.$el_body_content = $(base.$el_body.find('.table-contents')[0]);
                base.el_body_content = base.$el_body.find('.table-contents')[0];
            }

            if(base.$el.find('.sibdatatable-footer').length <= 0) {
                base.$el.append('<div class="sibdatatable-footer sibdatatable-inner" style="display: none;"></div>');
                base.$el_footer = $(base.$el.find('.sibdatatable-footer')[0]);
                base.el_footer = base.$el.find('.sibdatatable-footer')[0];
                selectPagelimit = '<select class="sibdatatable-limit-select"><option value="10">10</option><option value="15">15</option><option value="20">20</option><option value="25">25</option><option value="50">50</option><option value="100">100</option></select>';
                base.$el_footer.append('<div class="sibdatatable-limit"><span>'+ base.options.pagelimitTitle +'</span>' + selectPagelimit + '</div>');
                base.$el_footer.append('<div class="sibdatatable-navi"><span class="sibdatatable-navi-prev" style="display: none;"><i class="fa fa-angle-left fa-lg"></i></span><span class="sibdatatable-navi-title"  style="display: none;"></span><span class="sibdatatable-navi-next" style="display: none;"><i class="fa fa-angle-right fa-lg"></i></span></div>');
                base.$el_footer.find('.sibdatatable-navi-prev').bind("click", function() {
                    onClickNaviPrev(this);
                });
                base.$el_footer.find('.sibdatatable-navi-next').bind("click", function() {
                    onClickNaviNext(this);
                });
                $(base.$el_footer.find('.sibdatatable-limit-select')[0]).val(base.options.pagingLimit);
                base.$el_footer.find('.sibdatatable-limit-select').bind('change', function() {
                    onChangePageLimit(this);
                });
            }
        }

        // Method for click prev button.
        function onClickNaviPrev(el) {
            if(curPageNumber <= 0) {
                return false;
            }
            curPageNumber = curPageNumber -1;
            refreshTable();
            debug('Prev button clicked. page number : ' + curPageNumber);
        }

        // Method for click next button.
        function onClickNaviNext(el) {
            curPageNumber = curPageNumber + 1;
            refreshTable();
            debug('Next button clicked. page number : ' + curPageNumber);
        }

        // Method for select a page limit.
        function onChangePageLimit(el) {
            curPageLimit = $(el).val();
            refreshTable();
            debug('Page limit changed : ' + curPageLimit);
        }

        // Change Sort.
        function onClickChangeSort(el) {
            var sort_val = $(el).attr("data-sort-val");
            if(sort_val == curOrderby) {
                if(curOrder == 'asc') {
                    curOrder = 'desc';
                }
                else {
                    curOrder = 'asc';
                }
            }
            else {
                curOrderby = sort_val;
                curOrder = 'asc';
            }
            refreshTable();
        }

        // Check if current is first.
        function isFirstPage() {
            if(curPageNumber == 0) {
                return true;
            }
            return false;
        }

        // Check if current is last.
        function isLastPage() {
            var viewLastIndex = curPageNumber * curPageLimit + curCount + 1;
            if(viewLastIndex >= totalCount) {
                return true;
            }
            return false;
        }

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        // Add a reverse reference to the DOM object
        base.$el.data("sibdatatable", base);

        base.init = function(){
            base.options = $.extend({},$.sibdatatable.defaultOptions, options);
            // Put your initialization code here.
            // 1. Validation for options process.
            checkOptions();
            // 2. Make the template of table.
            makeTemplateTable();
            // 3. Get the data of a table from data source and then display table.
            refreshTable();
        };

        // Sample Function, Uncomment to use
        // base.functionName = function(paramaters){
        //
        // };

        // Run initializer
        base.init();
    };

    $.sibdatatable.defaultOptions = {
        dataSourceType: 'html', // html, json, remote
        dataSource: null, // json variable or remote url
        Columns: null, // if null, display all columns. Note : if dataSourceType is remote, you need to set this field
        sortable: false, // false or true
        filterable:false, // false or true
        pageable: true, // false or true
        pagingLimit: 25, // 10,20,25,50,100
        order:'asc', // asc or desc
        orderBy: null,
        pagelimitTitle: 'View',
        remoteParamsIn: { // remote request format
            getMethod: 'get', // post or get
            pagingLimit : 'paging_limit',
            pageNumber : 'page_number',
            orderBy : 'orderby',
            order : 'order'
        },
        remoteParamsOut: { // remote request format
            totalCount: 'total_count',
            getCount: 'get_count',
            elements : 'contacts'
        }

    };

    $.fn.sibdatatable = function(options){
        return this.each(function(){
            var bp = new $.sibdatatable(this, options);
        });
    };

})(jQuery);