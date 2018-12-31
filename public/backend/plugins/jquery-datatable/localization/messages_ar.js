(function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( ["jquery", "../jquery.dataTables"], factory );
	} else if (typeof module === "object" && module.exports) {
		module.exports = factory( require( "jquery" ) );
	} else {
		factory( jQuery );
	}
}(function( $ ) {

/*
 * Translated default messages for the datatable plugin.
 * Locale: AR (Arabic; العربية)
 */
$.extend( true, $.fn.dataTable.defaults, {
	"language": {
		"sProcessing":   "جارٍ التحميل...",
		"sLengthMenu":   "أظهر _MENU_ مدخلات",
		"sZeroRecords":  "لم يعثر على أية سجلات",
		"sInfo":         "إظهار _START_ إلى _END_ من أصل _TOTAL_ مدخل",
		"sInfoEmpty":    "يعرض 0 إلى 0 من أصل 0 سجل",
		"sInfoFiltered": "(منتقاة من مجموع _MAX_ مُدخل)",
		"sInfoPostFix":  "",
		"sSearch":       "ابحث:",
		"sUrl":          "",
		"oPaginate": {
			"sFirst":    "الأول",
			"sPrevious": "السابق",
			"sNext":     "التالي",
			"sLast":     "الأخير"
		},
		"buttons": {
			"copy": "نسخ",
			"csv": "ملفات مفصولة بفواصل",
			"excel": "تفوق",
			"pdf": "قوات الدفاع الشعبي",
			"print": "طباعة",
			"copyTitle": 'نسخ إلى الحافظة',
			"copyKeys": 'إضغط على <i>ctrl</i> أو <i>\u2318</i> + <i>C</i> لنسخ بيانات الجدول إلى الحافظة الخاصة بك. <br><br>للإلغاء ، انقر فوق هذه الرسالة أو اضغط على Esc.',
			"copySuccess": {
				_: '%d الخطوط المنسوخة',
				1: '1 خط منسوخ'
			}
		},
		
	}
});

}));