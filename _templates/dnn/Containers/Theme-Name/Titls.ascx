<%@ Control language="c#" AutoEventWireup="false" Explicit="True" Inherits="DotNetNuke.UI.Containers.Container" %>
<%@ Register TagPrefix="dnn" TagName="TITLE" Src="~/Admin/Containers/Title.ascx" %>
<div class="[Theme-Name]-module-container module-container module-conatiner-title" id="<%= ID %>">
	<h3 class="module-container__title"><dnn:Title runat="server" id="dnnTitle" /></h3>
	<div class="module-conatiner-transparent__content-pane module-container__content-pane" runat="server" id="ContentPane"></div>
</div>