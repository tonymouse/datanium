Ext.define('Datanium.GlobalData', {
	singleton : true,
	tabindex : 0,
	queryParam : {
		dimensions : [],
		measures : [],
		groups : []
	},
	qubeInfo : {
		dimensions : [],
		measures : []
	},
	queryResult : {},
	enableQuery : false,
	groups : [],
	rptMode : 'grid'
});