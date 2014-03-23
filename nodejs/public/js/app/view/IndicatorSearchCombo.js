Ext.define('Datanium.view.IndicatorSearchCombo', {
	extend : 'Ext.form.field.ComboBox',
	alias : 'widget.searchcombo',
	displayField : 'text',
	valueField : 'uniqueName',
	queryMode : 'remote',
	triggerAction : 'all',
	lastQuery : '',
	store : 'Indicators',
	typeAhead : true,
	forceFit : true,
	selectOnFocus : true,
	forceSelection : false,
	allowBlank : true,
	emptyText : 'Search for Indicators',
	height : 22,
	margin : '5 5'
});