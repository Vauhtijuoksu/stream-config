obs = obslua
settings = {}

function script_description()
	return [[
Toggle next prefixed source visible when scene is activated.
]]
end

function script_properties()
	local props = obs.obs_properties_create()

	obs.obs_properties_add_text(props, "addindex", "Start from: (INT)", obs.OBS_TEXT_DEFAULT)
	obs.obs_properties_add_text(props, "prefix", "Source prefix:", obs.OBS_TEXT_DEFAULT)

	local scenes = obs.obs_frontend_get_scenes()

	if scenes ~= nil then
		for _, scene in ipairs(scenes) do
			local scene_name = obs.obs_source_get_name(scene)
			obs.obs_properties_add_bool(props, "scene_enabled_" .. scene_name, "Show adds when '" .. scene_name .. "' is activated")
		end
	end
	obs.source_list_release(scenes)
	return props
end

-- Script hook that is called whenver the script settings change
function script_update(_settings)
	settings = _settings
end

-- Script hook that is called when the script is loaded
function script_load(settings)
	obs.script_log(obs.LOG_INFO, "script loaded")
	obs.obs_frontend_add_event_callback(handle_event)
end

function handle_event(event)
	if event == obs.OBS_FRONTEND_EVENT_SCENE_CHANGED then
		handle_scene_change()
	end
end

function handle_scene_change()
	-- get current source
	local source = obs.obs_frontend_get_current_scene()
	local scene_name = obs.obs_source_get_name(source)
	local scene_enabled = obs.obs_data_get_bool(settings, "scene_enabled_" .. scene_name)
	if scene_enabled then
		local scene = obs.obs_scene_from_source(source)
		local current_add = obs.obs_data_get_string(settings, "addindex")
		current_add = tonumber(current_add)
		local prefix = obs.obs_data_get_string(settings, "prefix")
		local sceneitems = obs.obs_scene_enum_items(scene)
		local item_count = 0
		for i, sceneitem in ipairs(sceneitems) do
			local itemsource = obs.obs_sceneitem_get_source(sceneitem)
			local source_name = obs.obs_source_get_name(itemsource)
			if string.starts(source_name, prefix) then
				item_count = item_count + 1
				-- show current add. hide others.
				if current_add == i then
					obs.obs_sceneitem_set_visible(sceneitem, true)
					obs.script_log(obs.LOG_INFO, "Set source " .. source_name .. "visible!")
				else
					obs.obs_sceneitem_set_visible(sceneitem, false)
				end
			end
		end
		-- if add was found, increase counter.
		if item_count > 0 then
			current_add = current_add + 1
			if current_add > item_count then
				current_add = 1
			end
			obs.obs_data_set_string(settings, "addindex", tostring(current_add))
		end
		-- release resources
    	obs.sceneitem_list_release(sceneitems)
	end
	obs.obs_source_release(source);
end

-- Fucking LUA section:

function string.starts(String,Start)
   return string.sub(String,1,string.len(Start))==Start
end
