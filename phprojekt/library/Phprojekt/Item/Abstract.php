<?php
/**
 * An item, with database manager support
 *
 * This software is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License version 2.1 as published by the Free Software Foundation
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * @copyright  Copyright (c) 2008 Mayflower GmbH (http://www.mayflower.de)
 * @package    PHProjekt
 * @subpackage Core
 * @license    LGPL 2.1 (See LICENSE file)
 * @version    $Id$
 * @link       http://www.phprojekt.com
 * @author     Gustavao Solt <solt@mayflower.de>
 * @since      File available since Release 6.0
 */

/**
 * An item, with database manager support
 *
 * @copyright  Copyright (c) 2008 Mayflower GmbH (http://www.mayflower.de)
 * @package    PHProjekt
 * @subpackage Core
 * @license    LGPL 2.1 (See LICENSE file)
 * @version    Release: @package_version@
 * @link       http://www.phprojekt.com
 * @since      File available since Release 6.0
 * @author     Gustavao Solt <solt@mayflower.de>
 */
abstract class Phprojekt_Item_Abstract extends Phprojekt_ActiveRecord_Abstract implements Phprojekt_Model_Interface
{
    /**
     * Represents the database_manager class
     *
     * @var Phprojekt_ActiveRecord_Abstract
     */
    protected $_dbManager = null;

    /**
     * Validate object
     *
     * @var Phprojekt_Model_Validate
     */
    protected $_validate = null;

    /**
     * History object
     *
     * @var Phprojekt_History
     */
    protected $_history = null;

    /**
     * Config for inicializes children objects
     *
     * @var array
     */
    protected $_config = null;

    /**
     * Full text Search object
     *
     * @var Phprojekt_Search_Words
     */
    protected $_search = null;

    /**
     * Rights class object
     *
     * @var array
     */
    protected $_rights = null;

    /**
     * Field for display in the search results
     *
     * @var string
     */
    public $searchFirstDisplayField = 'title';

    /**
     * Field for display in the search results
     *
     * @var string
     */
    public $searchSecondDisplayField = 'notes';

    /**
     * Field for user timezone to be used on time conversion
     *
     * @var string
     */
    private $_timezone = null;

    /**
     * Initialize new object
     *
     * @param array $db Configuration for Zend_Db_Table
     */
    public function __construct($db = null)
    {
        parent::__construct($db);

        $this->_dbManager = new Phprojekt_DatabaseManager($this, $db);
        $this->_validate  = Phprojekt_Loader::getLibraryClass('Phprojekt_Model_Validate');
        $this->_history   = Phprojekt_Loader::getLibraryClass('Phprojekt_History');
        $this->_search    = Phprojekt_Loader::getLibraryClass('Phprojekt_Search_Default');
        $this->_config    = Phprojekt::getInstance()->getConfig();
        $this->_rights    = Phprojekt_Loader::getLibraryClass('Phprojekt_Item_Rights');
        $this->_timezone  = (int)Phprojekt_User_User::getSetting("timeZone", $this->_config->timeZone);
    }

    /**
     * Define the clone function for prevent the same point to same object.
     *
     * @return void
     */
    public function __clone()
    {
        parent::__clone();
        $this->_validate  = Phprojekt_Loader::getLibraryClass('Phprojekt_Model_Validate');
        $this->_history   = Phprojekt_Loader::getLibraryClass('Phprojekt_History');
        $this->_search    = Phprojekt_Loader::getLibraryClass('Phprojekt_Search_Default');
        $this->_rights    = Phprojekt_Loader::getLibraryClass('Phprojekt_Item_Rights');
    }

    /**
     * Returns the database manager instance used by this phprojekt item
     *
     * @return Phprojekt_DatabaseManager
     */
    public function getInformation()
    {
        return $this->_dbManager;
    }

    /**
     * Enter description here...
     *
     * @return Phprojekt_DatabaseManager_Field
     */
    public function current()
    {
        return new Phprojekt_DatabaseManager_Field($this->getInformation(), $this->key(), parent::current());
    }

    /**
     * Assign a value to a var using some validations from the table data
     *
     * @param string $varname Name of the var to assign
     * @param mixed  $value   Value for assign to the var
     *
     * @throws InvalidArgumentException
     *
     * @return void
     */
    public function __set($varname, $value)
    {
        $varForInfo = Phprojekt_ActiveRecord_Abstract::convertVarToSql($varname);
        $info       = $this->info();

        if (isset($info['metadata'][$varForInfo])) {

            $type = $info['metadata'][$varForInfo]['DATA_TYPE'];

            switch ($type) {
                case 'int':
                    $value = Cleaner::sanitize('integer', $value, 0);
                    break;
                case 'float':
                    $value = Cleaner::sanitize('float', $value, 0);
                    if ($value !== false) {
                        $value = Zend_Locale_Format::getFloat($value, array('precision' => 2));
                    } else {
                        $value = 0;
                    }
                    break;
                case 'date':
                    $value = Cleaner::sanitize('date', $value);
                    break;
                case 'time':
                    $value = Cleaner::sanitize('time', $value);

                    // moving the value to UTC
                    $timeZoneComplement = (int) $this->_timezone * -1;
                    $u = strtotime($value);

                    $value = mktime(date("H", $u) + $timeZoneComplement, date("i", $u),
                             date("s", $u), date("m"), date("d"), date("Y"));

                    $value = date("H:i:s", $value);
                    break;
                case 'datetime':
                case 'timestamp':
                    $value = Cleaner::sanitize('timestamp', $value);

                    // moving the value to UTC
                    $timeZoneComplement = (int) $this->_timezone * -1;
                    $u = strtotime($value);

                    $value = mktime(date("H", $u) + $timeZoneComplement, date("i", $u),
                             date("s", $u), date("m", $u), date("d", $u), date("Y", $u));

                    // running again the sanitizer to normalize the format
                    $value = Cleaner::sanitize('timestamp', $value);
                    break;
                case 'text':
                    if (is_array($value)) {
                        // if given value for a text field is an array, it's from a MultiSelect field
                        $value = implode(',', $value);
                    }
                    // Run html sanitize only if the text contain some html code
                    if (preg_match("/([\<])([^\>]{1,})*([\>])/i", $value)) {
                        $value = Cleaner::sanitize('html', $value);
                    } else {
                        $value = Cleaner::sanitize('string', $value);
                    }
                    break;
                default:
                    $value = Cleaner::sanitize('string', $value);
                    break;
            }
        } else {
            $value = Cleaner::sanitize('string', $value);
        }

        if ($value === false) {
            throw new InvalidArgumentException('Type doesnot match it\'s definition: ' . $varname .
                                               ' expected to be ' . $type .'.');
        }

        parent::__set($varname, $value);
    }

    /**
     * Return if the values are valid or not
     *
     * @return boolean
     */
    public function recordValidate()
    {
        $data      = $this->_data;
        $fields    = $this->_dbManager->getFieldDefinition(Phprojekt_ModelInformation_Default::ORDERING_FORM);

        return $this->_validate->recordValidate($this, $data, $fields);
    }

    /**
     * Get a value of a var.
     * Is the var is a float, return the locale float
     *
     * @param string $varname Name of the var to assign
     *
     * @return mixed
     */
    public function __get($varname)
    {
        $info       = $this->info();
        $value      = parent::__get($varname);
        $varForInfo = Phprojekt_ActiveRecord_Abstract::convertVarToSql($varname);

        if (true == isset($info['metadata'][$varForInfo])) {
            $type = $info['metadata'][$varForInfo]['DATA_TYPE'];
            switch ($type) {
                case 'float':
                    $value = Zend_Locale_Format::toFloat($value, array('precision' => 2));
                    break;
                case 'time':
                    $timeZone = (int) $this->_timezone;
                    $u = strtotime($value);

                    $value = mktime(date("H", $u) + $timeZone, date("i", $u), date("s", $u),
                             date("m"), date("d"), date("Y"));

                    $value = date("H:i:s", $value);
                    break;
                case 'datetime':
                case 'timestamp':
                    $timeZone = (int) $this->_timezone * -1;
                    $u = strtotime($value);

                    $value = mktime(date("H", $u) + $timeZone, date("i", $u), date("s", $u),
                             date("m", $u), date("d", $u), date("Y", $u));
                    break;
            }
        }

        if (null !== $value && is_string($value)) {
            $value = stripslashes($value);
        }

        return $value;
    }

    /**
     * Return the error data
     *
     * @return array
     */
    public function getError()
    {
        return (array) $this->_validate->error->getError();
    }

    /**
     * Extension of the Abstract Record to save the history
     *
     * @return void
     */
    public function save()
    {
        $result = true;
        if ($this->id > 0) {
            $this->_history->saveFields($this, 'edit');
            $result = parent::save();
        } else {
            $result = parent::save();
            $this->_history->saveFields($this, 'add');
        }

        $this->_search->indexObjectItem($this);

        return $result;
    }

    /**
     * Use directly the the Abstract Record to don't save the history or search words
     *
     * @return void
     */
    public function parentSave()
    {
        return parent::save();
    }

    /**
     * Extension of the Abstract Record to delete an item
     *
     * @return void
     */
    public function delete()
    {
        $moduleId = Phprojekt_Module::getId($this->getModelName());

        // Is there is any upload file, -> delete the files from the server
        $fields = $this->getInformation()->getInfo(Phprojekt_ModelInformation_Default::ORDERING_FORM,
            Phprojekt_DatabaseManager::COLUMN_NAME);
        foreach ($fields as $field) {
            if ($this->getInformation()->getType($field) == 'upload') {
                $filesField = $this->$field;
                $files = split('\|\|', $filesField);
                foreach ($files as $file) {
                    $md5Name = substr($file, 0, strpos($file, '|'));
                    $fileAbsolutePath = Phprojekt::getInstance()->getConfig()->uploadpath . $md5Name;
                    if (file_exists($fileAbsolutePath)) {
                        unlink($fileAbsolutePath);
                    }
                }
            }
        }

        $this->_history->saveFields($this, 'delete');
        $this->_search->deleteObjectItem($this);
        $this->_rights->_save($moduleId, $this->id, array());
        parent::delete();
    }

    /**
     * Return wich submodules use this module
     *
     * @return array
     */
    public function getSubModules()
    {
        return array();
    }

    /**
     * Return the fields that can be filtered
     *
     * This function must be here for be overwrited by the default module
     *
     * @return array
     */
    public function getFieldsForFilter()
    {
        return $this->getInformation()->getInfo(Phprojekt_ModelInformation_Default::ORDERING_LIST,
            Phprojekt_DatabaseManager::COLUMN_NAME);
    }

    /**
     * Rewrites parent fetchAll, so that only records with read access are shown
     *
     * @param string|array $where  Where clause
     * @param string|array $order  Order by
     * @param string|array $count  Limit query
     * @param string|array $offset Query offset
     * @param string       $select The comma-separated columns of the joined columns
     * @param string       $join   The join statements
     *
     * @return Zend_Db_Table_Rowset
     */
    public function fetchAll($where = null, $order = null, $count = null, $offset = null, $select = null, $join = null)
    {
        // only fetch records with read access
        $join .= sprintf(' INNER JOIN item_rights ON (item_rights.item_id = %s
                         AND item_rights.module_id = %d AND item_rights.user_id = %d) ',
                         $this->getAdapter()->quoteIdentifier($this->getTableName().'.id'),
                         Phprojekt_Module::getId($this->getModelName()),
                         Phprojekt_Auth::getUserId());

        // Set where
        if (null !== $where) {
            $where .= ' AND ';
        }
        $where .= ' (' . sprintf('(%s.owner_id = %d OR %s.owner_id is NULL)', $this->getTableName(),
            Phprojekt_Auth::getUserId(), $this->getTableName());
        $where .= ' OR (item_rights.access > 0)) ';

        return parent::fetchAll($where, $order, $count, $offset, $select, $join);
    }

    /**
     * Returns the right for each user has on a Phprojekt item
     *
     * @return array
     */
    public function getRights()
    {
        $rights   = $this->_rights->getRights(Phprojekt_Module::getId($this->getModelName()), $this->id);
        $saveType = Phprojekt_Module::getSaveType(Phprojekt_Module::getId($this->getModelName()));
        switch ($saveType) {
            case 0:
                $moduleId        = Phprojekt_Module::getId($this->getModelName());
                $roleRights      = new Phprojekt_RoleRights($this->projectId, $moduleId, $this->id);
                $roleRightRead   = $roleRights->hasRight('read');
                $roleRightWrite  = $roleRights->hasRight('write');
                $roleRightCreate = $roleRights->hasRight('create');
                $roleRightAdmin  = $roleRights->hasRight('admin');

                // Map roles with item rights and make one array
                foreach ($rights as $userId => $access) {
                    foreach ($access as $name => $value) {
                        switch ($name) {
                            case 'admin':
                                $rights[$userId]['admin'] = $roleRightAdmin && $value;
                                break;
                            case 'download':
                                $rights[$userId]['download'] = ($roleRightRead || $roleRightWrite || $roleRightAdmin)
                                    && $value;
                                break;
                            case 'delete':
                                $rights[$userId]['delete'] = ($roleRightWrite || $roleRightAdmin) && $value;
                                break;
                            case 'copy':
                                $rights[$userId]['copy'] = ($roleRightWrite || $roleRightCreate || $roleRightAdmin)
                                    && $value;
                                break;
                            case 'create':
                                $rights[$userId]['create'] = ($roleRightWrite || $roleRightCreate || $roleRightAdmin)
                                    && $value;
                                break;
                            case 'access':
                                $rights[$userId]['access'] = ($roleRightRead || $roleRightWrite || $roleRightCreate
                                || $roleRightAdmin) && $value;
                                break;
                            case 'write':
                                $rights[$userId]['write'] = ($roleRightWrite || $roleRightCreate || $roleRightAdmin)
                                    && $value;
                                break;
                            case 'read':
                                $rights[$userId]['read'] = ($roleRightRead || $roleRightWrite || $roleRightAdmin)
                                    && $value;
                                break;
                            case 'none':
                                $rights[$userId]['none'] = $value;
                                break;
                        }
                    }
                }
                break;
            case 1:
                break;
            case 2:
                // Implement saveType 2
                break;
        }

        return $rights;
    }

    /**
     * Save the rights for the current item
     * The users are a POST array with userIds
     *
     * @param array $rights - Array of usersId with the bitmask access
     *
     * @return void
     */
    public function saveRights($rights)
    {
        $this->_rights->_save(Phprojekt_Module::getId($this->getModelName()), $this->id, $rights);
    }
}
