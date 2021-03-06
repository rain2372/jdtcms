var R_content = React.createClass({displayName: "R_content",
	getInitialState: function() { 
		var role = window.sessionStorage.getItem("crole");
		var isAdmin = (role=="管理员")?"":"none";
		return {data: [],total:0,totalpage: [],isFirst:"am-disabled",isLast:"am-disabled",isAdmin:isAdmin};
	},
	newDoc:function(){
		window.sessionStorage.setItem("mode","new");
		window.sessionStorage.removeItem("editid");
		window.sessionStorage.removeItem("startDate");
		window.location = 'userform.html';
	},
	readDoc:function(id){
		window.sessionStorage.setItem("readdocid",id);
		window.location = 'booking_read.html';
	},
	delDoc:function(id,e){
		var o = this;
		e.preventDefault();
		window.sessionStorage.setItem("delid",id);
		$("#del-confirm").modal();
	},
	editDoc:function(id,startDate,e){
		var o = this;
		e.preventDefault();
		window.sessionStorage.setItem("editid",id);
		window.sessionStorage.setItem("mode","edit");
		window.location = 'userform.html';
	},
	resetKey:function(){
		window.location.reload();
	},
	delsql:function(){
		var o = this;
		$.ajax({
			type: "post",
			url: hosts + "/user/delUser",
			data: {
				id:window.sessionStorage.getItem("delid")
			},
			success: function(data) {
				if(data == "300"){
					o.toPage(window.sessionStorage.getItem("indexPage"));
					$('.successinfo').html('<p>删除成功</p>').removeClass("none");
					setTimeout(function() {
						$('.successinfo').addClass("none");
					}, 2000);
				}
			}
		});
	},
	ActiveDoc:function(id,username,e){
		e.preventDefault();
		var o = this;
		$.ajax({
			type: "post",
			url: hosts + "/modeluser/activeUser",
			data: {
				id:id,
				username:username
			},
			success: function(data) {
				if(data == "300"){
					o.toPage(window.sessionStorage.getItem("indexPage"));
					$('.successinfo').html('<p>激活成功</p>').removeClass("none");
					setTimeout(function() {
						$('.successinfo').addClass("none");
					}, 2000);
				}
			}
		});
	},
	disActiveDoc:function(id,username,e){
		e.preventDefault();
		var o = this;
		$.ajax({
			type: "post",
			url: hosts + "/modeluser/disactiveUser",
			data: {
				id:id,
				username:username
			},
			success: function(data) {
				if(data == "300"){
					o.toPage(window.sessionStorage.getItem("indexPage"));
					$('.successinfo').html('<p>停权成功</p>').removeClass("none");
					setTimeout(function() {
						$('.successinfo').addClass("none");
					}, 2000);
				}
			}
		});
	},
	toPage:function(page,e){
		var o = this;
		if(e){
			e.preventDefault();
		}
		var $modal = $('#my-modal-loading');
		$modal.modal();
		window.sessionStorage.setItem("indexPage",page);
		var indexPage = window.sessionStorage.getItem("indexPage");
		var id = window.sessionStorage.getItem('cid');
		indexPage = indexPage?indexPage:1;
		
		/*查询参数*/
		var name = $("#name").val();
		var mobile = $("#mobile").val();
		var company = $("#company").val();
		var address = $("#address").val();
		var job = $("#job").val();
		var start_time = $("#start_time").val();
		var end_time = $("#end_time").val();
		
		$.ajax({
			type: "post",
			url: hosts + "/modeluser/getUser",
			data: {
				indexPage:indexPage,
				name:name,
				mobile:mobile,
				company:company,
				address:address,
				job:job,
				start_time:start_time,
				end_time:end_time
			},
			success: function(data) {
				o.setState({data:data.record});
				o.setState({total:data.total});
				o.setState({totalpage:data.totalpage});
				o.setState({isFirst:(data.isFirstPage?"am-disabled":"")});
				o.setState({isLast:(data.isLastPage?"am-disabled":"")});
				$modal.modal('close');
			}
		});
	},
	componentDidMount:function(){
		var o = this;
		$("#start_time").bind("click",function(){
			$('#start_time').datepicker('open');
		});
		$("#end_time").bind("click",function(){
			$('#end_time').datepicker('open');
		});
		this.toPage(1);
	},
	render:function(){
		var o = this;
		var list = this.state.data.map(function(c){
			var limited = c.limited?new Date(c.limited).Format("yyyy-MM-dd hh:mm:ss"):"";
			if(c.state_id == 0){
				return(
					React.createElement("tr", null, 
		              React.createElement("td", null, c.name), 
		              React.createElement("td", null, c.mobile), 
		              React.createElement("td", null, c.company), 
		              React.createElement("td", null, c.address), 
		              React.createElement("td", null, c.job), 
		              React.createElement("td", null, c.applytime?new Date(c.applytime).Format("yyyy-MM-dd hh:mm:ss"):""), 
		              React.createElement("td", null, c.state_id == 0?'未激活':'已激活'), 
		              React.createElement("td", null, 
		                React.createElement("div", {className: "am-hide-sm-only am-btn-toolbar"}, 
		                  React.createElement("div", {className: "am-btn-group am-btn-group-xs"}, 
		                    React.createElement("button", {onClick: o.ActiveDoc.bind(o,c.id,c.username), className: "am-btn am-btn-default am-btn-xs am-text-secondary"}, React.createElement("span", {className: "am-icon-bell"}), " 激活")
		                  )
		                )
		              )
		            )
				);
			}else{
				return(
					React.createElement("tr", null, 
		              React.createElement("td", null, c.name), 
		              React.createElement("td", null, c.mobile), 
		              React.createElement("td", null, c.company), 
		              React.createElement("td", null, c.address), 
		              React.createElement("td", null, c.job), 
		              React.createElement("td", null, c.applytime?new Date(c.applytime).Format("yyyy-MM-dd hh:mm:ss"):""), 
		              React.createElement("td", null, c.state_id == 0?'未激活':'已激活'), 
		              React.createElement("td", null, 
		                React.createElement("div", {className: "am-hide-sm-only am-btn-toolbar"}, 
		                  React.createElement("div", {className: "am-btn-group am-btn-group-xs"}
		                  )
		                )
		              )
		            )
				);
			}
		});
		var pager=[];
		var iPa = Number(window.sessionStorage.getItem("indexPage"));
		iPa = iPa?iPa:1;
        for(var i=1;i<(this.state.totalpage)+1;i++){
        	var hasClass = "";
        	if(i == iPa){
        		hasClass = "am-active";
        	}
            pager.push(
                React.createElement("li", {className: hasClass}, React.createElement("a", {href: "#", onClick: o.toPage.bind(o,i)}, i))
            )
        }
		return(
			React.createElement("div", {className: "admin-content"}, 
			
			    React.createElement("div", {className: "am-cf am-padding"}, 
			      React.createElement("div", {className: "am-fl am-cf"}, React.createElement("strong", {className: "am-text-primary am-text-lg"}, "积分审核账户"), " / ", React.createElement("small", null, "列表"))
				), 
			    React.createElement("div", {className: "am-g"}, 
			      React.createElement("div", {className: "am-u-sm-12 am-u-md-12"}, 
			        React.createElement("div", {className: "am-btn-toolbar"}, 
			          React.createElement("div", {className: "am-btn-group am-btn-group-xs"}, 
			            React.createElement("button", {id: "btn_add", type: "button", onClick: this.newDoc, className: "am-btn am-btn-default none"}, React.createElement("span", {className: "am-icon-plus"}), " 新增")
			          )
			        )
			      )
			    ), 
			    
			    React.createElement("div", {className: "am-g"}, 
			      React.createElement("div", {className: "am-u-sm-12 am-u-md-12 menu-search"}, 
			        React.createElement("div", {className: "am-btn-toolbar"}, 
			          		React.createElement("input", {type: "text", id: "name", className: "am-input-sm search_input", placeholder: "姓名"}), 
			          		React.createElement("input", {type: "text", id: "mobile", className: "am-input-sm search_input", placeholder: "手机"}), 
			          		React.createElement("input", {type: "text", id: "company", className: "am-input-sm search_input", placeholder: "所属公司"}), 
			          		React.createElement("input", {type: "text", id: "address", className: "am-input-sm search_input", placeholder: "地址"}), 
			          		React.createElement("input", {type: "text", id: "job", className: "am-input-sm search_input", placeholder: "职位"}), 
			          		React.createElement("br", null), "申请时间：", 
			          		React.createElement("input", {type: "text", id: "start_time", className: "am-form-field date_sel", placeholder: "开始日期", "data-am-datepicker": true, readOnly: true, required: true}), 
			          		React.createElement("input", {type: "text", id: "end_time", className: "am-form-field date_sel", placeholder: "结束日期", "data-am-datepicker": true, readOnly: true, required: true}), 
			          		React.createElement("button", {type: "button", onClick: this.toPage.bind(o,1), className: "btn-c am-btn am-btn-primary am-btn-xs btn-search"}, React.createElement("span", {className: "am-icon-search"}), " 查询"), 
			          		React.createElement("button", {type: "button", onClick: this.resetKey, className: "btn-c am-btn am-btn-default am-btn-xs btn-search"}, React.createElement("span", {className: "am-icon-bitbucket"}), " 清空")
			        )
			      )
			    ), 
			    
			    React.createElement("div", {className: "am-g"}, 
				    React.createElement("div", {className: "am-u-sm-12"}, 
				        React.createElement("form", {className: "am-form"}, 
				          React.createElement("table", {className: "am-table am-table-striped am-table-hover table-main jdt-table"}, 
				            React.createElement("thead", null, 
				              React.createElement("tr", null, 
				                React.createElement("th", null, "姓名"), 
			            		React.createElement("th", null, "手机"), 
			            		React.createElement("th", null, "所属公司"), 
			            		React.createElement("th", null, "地址"), 
			            		React.createElement("th", null, "职务"), 
			            		React.createElement("th", null, "申请时间"), 
			            		React.createElement("th", null, "激活状态"), 
			            		React.createElement("th", {className: "am-hide-sm-only table-set"}, "操作")
				              )
				          	), 
				          	React.createElement("tbody", null, 
				          		list
				          	)
				          ), 
				          	React.createElement("div", {className: "am-cf"}, 
							  "共 ", this.state.total, " 条记录", 
							  React.createElement("div", {className: "am-fr"}, 
							    React.createElement("ul", {className: "am-pagination"}, 
							      React.createElement("li", {className: this.state.isFirst}, React.createElement("a", {href: "#", onClick: this.toPage.bind(this,Number(window.sessionStorage.getItem("indexPage"))-1)}, "«")), 
							      pager, 
							      React.createElement("li", {className: this.state.isLast}, React.createElement("a", {href: "#", onClick: this.toPage.bind(this,Number(window.sessionStorage.getItem("indexPage"))+1)}, "»"))
							    )
							  )
							)
				        )
				    )
				), 
				React.createElement("div", {className: "am-modal am-modal-confirm", tabIndex: "-1", id: "del-confirm"}, 
				  React.createElement("div", {className: "am-modal-dialog"}, 
				    React.createElement("div", {className: "am-modal-hd"}, "提示"), 
				    React.createElement("div", {className: "am-modal-bd"}, 
				      "你，确定要删除这条记录吗？"
				    ), 
				    React.createElement("div", {className: "am-modal-footer"}, 
				      React.createElement("span", {className: "am-modal-btn", "data-am-modal-cancel": true}, "取消"), 
				      React.createElement("span", {className: "am-modal-btn", "data-am-modal-confirm": true, onClick: this.delsql}, "确定")
				    )
				  )
				)
			)
		);
	}
});