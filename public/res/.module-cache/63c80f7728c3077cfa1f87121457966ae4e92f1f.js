var R_content = React.createClass({displayName: "R_content",
	getInitialState: function() { 
		var role = window.sessionStorage.getItem("crole");
		var isAdmin = (role=="管理员")?"":"none";
		return {data: [],total:0,totalpage: [],isFirst:"am-disabled",isLast:"am-disabled",isAdmin:isAdmin};
	},
	newDoc:function(){
		window.sessionStorage.setItem("mode","new");
		window.sessionStorage.removeItem("editid");
		window.location = 'postform.html';
	},
	readDoc:function(id){
		window.open('post_read.html?id='+id);
	},
	delDoc:function(id,e){
		var o = this;
		e.preventDefault();
		window.sessionStorage.setItem("delid",id);
		$("#del-confirm").modal();
	},
	showAddress:function(id,e){
		var o = this;
		e.preventDefault();
		$('.successinfo').html('<p>删除成功</p>').removeClass("none");
		setTimeout(function() {
			$('.successinfo').addClass("none");
		}, 10000);
	},
	editDoc:function(id,e){
		var o = this;
		e.preventDefault();
		window.sessionStorage.setItem("editid",id);
		window.sessionStorage.setItem("mode","edit");
		window.location = 'postform.html';
	},
	delsql:function(){
		var o = this;
		$.ajax({
			type: "post",
			url: hosts + "/post/delPost",
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
	toPage:function(page,e){
		var o = this;
		if(e){
			e.preventDefault();
		}
		window.sessionStorage.setItem("indexPage",page);
		var indexPage = window.sessionStorage.getItem("indexPage");
		var id = window.sessionStorage.getItem('cid');
		var role = window.sessionStorage.getItem("crole");
		indexPage = indexPage?indexPage:1;
		$.ajax({
			type: "post",
			url: hosts + "/post/getPost",
			data: {
				indexPage:indexPage
			},
			success: function(data) {
				o.setState({data:data.record});
				o.setState({total:data.total});
				o.setState({totalpage:data.totalpage});
				o.setState({isFirst:(data.isFirstPage?"am-disabled":"")});
				o.setState({isLast:(data.isLastPage?"am-disabled":"")});
			}
		});
	},
	componentDidMount:function(){
		var o = this;
		var $modal = $('#my-modal-loading');
		$modal.modal();
		var indexPage = window.sessionStorage.getItem("indexPage");
		var id = window.sessionStorage.getItem('cid');
		indexPage = indexPage?indexPage:1;
		var role = window.sessionStorage.getItem("crole");
		if(role == "管理员"){
			$("#btn_add").removeClass("none");
		}
		$.ajax({
			type: "post",
			url: hosts + "/post/getPost",
			data: {
				indexPage:indexPage
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
	render:function(){
		var o = this;
		var list = this.state.data.map(function(c){
		var _url = hosts + "/post_read.html?id=" + c.id;
		return(
				React.createElement("tr", null, 
	              React.createElement("td", null, c.title), 
	              React.createElement("td", null, c.created_at), 
	              React.createElement("td", null, 
	                React.createElement("div", {className: "am-hide-sm-only am-btn-toolbar"}, 
	                  React.createElement("div", {className: "am-btn-group am-btn-group-xs"}, 
	                  	React.createElement("button", {onClick: o.showAddress.bind(o,c.id), className: "am-btn am-btn-default am-btn-xs am-text-secondary"}, React.createElement("span", {className: "am-icon-search"}), " 显示地址"), 
	                  	React.createElement("button", {onClick: o.readDoc.bind(o,c.id), className: "am-btn am-btn-default am-btn-xs am-text-secondary"}, React.createElement("span", {className: "am-icon-search"}), " 预览"), 
	                    React.createElement("button", {onClick: o.editDoc.bind(o,c.id), className: "am-btn am-btn-default am-btn-xs am-text-secondary"}, React.createElement("span", {className: "am-icon-pencil-square-o"}), " 编辑"), 
	                    React.createElement("button", {onClick: o.delDoc.bind(o,c.id), className: "am-btn am-btn-default am-btn-xs am-text-danger"}, React.createElement("span", {className: "am-icon-trash-o"}), " 删除")
	                  )
	                )
	              )
	            )
			);
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
			      React.createElement("div", {className: "am-fl am-cf"}, React.createElement("strong", {className: "am-text-primary am-text-lg"}, "软文管理"), " / ", React.createElement("small", null, "列表"))
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
				    React.createElement("div", {className: "am-u-sm-12"}, 
				        React.createElement("form", {className: "am-form"}, 
				          React.createElement("table", {className: "am-table am-table-striped am-table-hover table-main"}, 
				            React.createElement("thead", null, 
				              React.createElement("tr", null, 
				                React.createElement("th", null, "标题"), 
			            		React.createElement("th", null, "创建日期"), 
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