var store_template = {
	extend : 'Ext.data.Store',
	autoLoad : true,
	pageSize : 25,
	proxy : {
		type : 'memory',
		enablePaging : false,
		reader : {
			type : 'json',
			root : 'result',
			totalProperty : 'total'
		}
	}
};

var fields = [];
var columns = [];
var groups = [];

function generateDynamicModel(field) {
	var dataFields = getResultHeader(fields);
	columns = columnFactory(fields);
	modelFactory('DynamicGridModel', dataFields);
	storeFactory('DynamicGridStore', store_template, 'DynamicGridModel');
	DynamicGridStore.load();
	return DynamicGridStore;
}

function storeFactory(name, template, model) {
	template.model = model;
	template.data = Datanium.GlobalData.QueryResult;
	// console.log(template);
	eval(name + " = Ext.create('Ext.data.Store'," + Ext.encode(template) + ");");
}

function modelFactory(name, fields) {
	var model = {
		extend : 'Ext.data.Model',
		fields : fields
	};
	eval("Ext.define('" + name + "'," + Ext.encode(model) + ");");
}

function columnFactory(fields) {
	var temp_columns = [];
	// add column dimension

	// add other columns
	for ( var i = 0; i < fields.length; i++) {
		if ("group" in fields[i] == false || fields[i].group == null) {
			if (fields[i].data_type != 'dimension' || fields[i].field_type != 'column') {
				if ('is_parent' in fields[i]) {
					temp_columns.push(fields[i]);
				} else {
					var column = {
						text : "<strong>" + fields[i].text + "</strong>",
						uniqueName : fields[i].uniqueName,
						name : fields[i].text,
						sortable : true,
						dataIndex : fields[i].uniqueName,
						data_type : fields[i].data_type,
						displayOrder : fields[i].displayOrder,
						align : "auto"
					};
					columnCellStyle(column, fields[i]);

					temp_columns.push(column);
				}
			}
		}
	}
	temp_columns.sort(function(col1, col2) {
		return col1.displayOrder - col2.displayOrder;
	});
	var outputColumns = [];
	for ( var i = 0; i < temp_columns.length; i++) {
		outputColumns.push(temp_columns[i]);
	}
	return outputColumns;
}

function columnCellStyle(column, field) {
	if ("width" in field) {
		column.width = field.width;
	} else {
		var labelLength = field.text.length;
		var columnWidth = columnWidthGen(labelLength);
		column.width = columnWidth;
	}

	var rendererVal = "";
	if (field.data_type == 'number') {
		column.tdCls = "x-grid-cell-inner-right";
		rendererVal = rendererVal + "value = Ext.util.Format.number(value, '0,000.####');";
	} else if (field.data_type == 'percentage') {
		column.tdCls = "x-grid-cell-inner-right";
		rendererVal = rendererVal + "value = Ext.util.Format.number(value, '00.##%');";
	} else {
		column.tdCls = "x-grid-cell-inner-left";
	}

	if ("link_location" in field) {
		if (field.link_location == "cell") {
			rendererVal = rendererVal + "value = '<a href=\"#" + field.link_target + "\">' + value + '</a>';";
		}
	}

	if (rendererVal.length > 0) {
		column.renderer = function(value, metadata) {
			eval(rendererVal);
			return value;
		};
	}
}

function columnWidthGen(labelLength) {
	var width = labelLength * 8;
	if (width % 100 > 50) {
		width = 100;
	}
	if (width > 200) {
		width = 200;
	}
	if (width < 100) {
		width = 100;
	}
	return width;
}

// deprecated for column difference in results issue
function getResultHeader(fields_json) {
	var headers = [];
	if (fields_json != null && fields_json.length > 0) {
		for ( var i = 0; i < fields_json.length; i++) {
			headers.push(fields_json[i].uniqueName);
		}
	}
	return headers;
}

Ext.define('Datanium.view.DynamicDataGrid', {
	extend : 'Ext.grid.Panel',
	xtype : 'grouped-header-grid',
	alias : 'widget.dynamicdatagrid',
	initComponent : function() {
		Ext.apply(this, {
			columnLines : true,
			autoHeight : true,
			autoWidth : true,
			forceFit : false,
			border : false,
			viewConfig : {
				stripeRows : true
			}
		});
		fields = [];
		columns = [];
		groups = [];
		var fields_json = null;
		var results_json = null;
		if (Datanium.GlobalData.enableQuery) {
			if (Datanium.GlobalData.queryParam != null) {
				fields_json = Datanium.GlobalData.queryParam;
				if (Datanium.GlobalData.QueryResult != null) {
					results_json = Datanium.GlobalData.QueryResult;
				}
			} else {
				fields = [];
				columns = [];
				groups = [];
			}
		}
		if (fields_json != null) {
			if ("dimensions" in fields_json) {
				for ( var i = 0; i < fields_json.dimensions.length; i++) {
					var f = fields_json.dimensions[i];
					f.field_type = 'row';
					if (f.display)
						fields.push(f);
				}
				for ( var i = 0; i < fields_json.measures.length; i++) {
					var f = fields_json.measures[i];
					f.field_type = 'column';
					if (f.display)
						fields.push(f);
				}
				// for ( var i = 0; i < fields_json.groups.length; i++) {
				// groups.push(fields_json.groups[i]);
				// }
			}
		}
		// console.log(fields);
		// console.log(fields_json);
		// console.log(results_json);
		var store = generateDynamicModel(fields);
		this.dockedItems = [ {
			xtype : 'pagingtoolbar',
			store : store,
			dock : 'bottom',
			displayInfo : true,
			listeners : {
				afterrender : function() {
					Ext.Array.each(this.items.items, function(item) {
						item.hide();
					});
					this.child('tbfill').show();
					this.child('#displayItem').show();
				}
			}
		} ];
		this.store = store;
		this.columns = columns;
		this.callParent();
		/*
		 * this.addEvents('refreshDatagrid'); this.on('refreshDatagrid',
		 * function() { console.log('refreshDatagrid'); if
		 * (Datanium.util.CommonUtils.getCmpInActiveTab('dynamicdatagrid') !=
		 * null) { destroyGrid('dynamicdatagrid');
		 * Datanium.util.CommonUtils.getCmpInActiveTab('datagridview').insert(0,
		 * Ext.create('Datanium.view.DynamicDataGrid', { xtype :
		 * 'dynamicdatagrid', itemId :
		 * Datanium.util.CommonUtils.genItemId('dynamicdatagrid'), region :
		 * 'center', floatable : false, collapsible : false, header : false
		 * }).show()); } });
		 */
	}
});
