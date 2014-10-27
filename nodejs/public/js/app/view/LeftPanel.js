Ext.define('Datanium.view.LeftPanel', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.leftpanel',
	border : false,
	layout : {
		type : 'vbox',
		align : 'stretch'
	},
	initComponent : function() {
		Ext.apply(this, {
			defaults : {
				border : false
			},
			items : [ {
				xtype : 'accordion',
				flex : 1
			} ]
		});
		this.callParent();
	}
});