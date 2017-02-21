-- begin_generated_IBM_copyright_prolog

-- Licensed Materials - Property of IBM
-- 
-- 5724-N72 5655-WBS
-- 
-- Copyright IBM Corp. 2006, 2008 All Rights Reserved.
-- 
-- US Government Users Restricted Rights - Use, duplication or
-- disclosure restricted by GSA ADP Schedule Contract with
-- IBM Corp.

-- end_generated_IBM_copyright_prolog

------------------------------------------------

ALTER SESSION SET CURRENT_SCHEMA = __DBSCHEMA__;

DROP TABLE VERIFY;

DROP INDEX I_STT_ITM_LOCALIZE;
DROP INDEX I_STT_ITM_STATESET;
DROP INDEX I_STT_ITM_VALUEDAT;
DROP INDEX I_WDGTTNC_PAGE;
DROP INDEX I_WDGT_WR_ELEMENT;
DROP INDEX I_WDGT_WR_WIDGETIN;
DROP INDEX I_WDGTTST_ELEMENT;
DROP INDEX I_WDGTTST_WIDGET_I;
DROP INDEX I_WIRE_WIDGETINSTA;
DROP INDEX I_WIRE_SOURCEWID;
DROP INDEX I_WIRE_TARGETWID;
DROP INDEX I_STATESET;
DROP TABLE CRE_LARGE_CDATA;
DROP TABLE CRE_PAGE;
DROP TABLE CRE_STATE_ITEM;
DROP TABLE CRE_STATE_SET;
DROP TABLE CRE_WIDGET_INSTANCE_CRE_WIRE;
DROP TABLE CRE_WIDGET_INSTANCE;
DROP TABLE CRE_WIRE;

DROP VIEW  USERVIEWPERM_VW;
DROP VIEW  DEFAULTPERM_VW;
DROP INDEX UIUSER_IN;
DROP TABLE UIUSER;
DROP INDEX UV_VIEW;
DROP TABLE USERVIEWPERM;
DROP TABLE DEFAULTPERM;
DROP TABLE UISTATUSFLAG;
DROP TABLE UIUSERSTORAGE;

DROP TABLE UPGRADECOMPONENTS;
DROP TABLE UPGRADEOBJECTSTATUS;
DROP TABLE UPGRADEOBJECTHISTORY;
DROP TABLE UPGRADEEXCEPTIONS;
DROP TABLE UPGRADESTATUSRECORD;

DROP INDEX "WSRRLMPR_IDX1";
DROP TABLE "WSRRLMPR";
DROP TABLE "WSRRLMGR";
DROP TABLE "WSRRTREG";
DROP INDEX "WSRRTASK_IDX2";
DROP INDEX "WSRRTASK_IDX1";
DROP TABLE "WSRRTASK";

DROP TABLE SR_WMB_POLICY;
DROP TABLE SR_VALDTRPOLICY;
DROP TABLE SR_ENTITYACTION;
DROP TABLE SR_ASSOCIATED;
DROP TABLE SR_ASSERTION;
DROP INDEX SR_ANALYTICS_VER_IDX;
DROP TABLE SR_ANALYTICS;
