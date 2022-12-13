import {
  ArchiveBoxArrowDownIcon,
  ArrowRightCircleIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import { Accordion, AccordionControlProps, Menu } from '@mantine/core';
import { openConfirmModal, openModal } from '@mantine/modals';
import { mutate } from 'swr';
import { TaskList } from '../../../types/primitives/TaskList';
import TaskListEditForm from '../../forms/TaskListEditForm';

const TaskListAccordionControl = (
  props: AccordionControlProps & { list: TaskList }
) => {
  const { list, ...rest } = props;

  const updateList = async (list: TaskList) => {
    if (!list?.board_id) return;

    const res = await fetch(`/api/tasks/lists/${list.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: list.name,
      }),
    });

    if (res.ok) mutate(`/api/tasks/lists?boardId=${list.board_id}`);
  };

  const deleteList = async () => {
    if (!list?.board_id) return;

    const res = await fetch(`/api/tasks/lists/${list.board_id}`, {
      method: 'DELETE',
    });

    if (res.ok) mutate(`/api/tasks/lists?boardId=${list.board_id}`);
  };

  const showDeleteListModal = (list: TaskList) => {
    if (!list) return;
    openConfirmModal({
      title: (
        <div className="font-semibold">
          Delete {'"'}
          <span className="font-bold text-purple-300">{list.name}</span>
          {'" '}
          list
        </div>
      ),
      centered: true,
      children: (
        <div className="p-4 text-center">
          <p className="text-lg font-medium text-zinc-300">
            Are you sure you want to delete this list?
          </p>
          <p className="text-sm text-zinc-500">
            All of your data will be permanently removed. This action cannot be
            undone.
          </p>
        </div>
      ),
      onConfirm: () => deleteList(),
      closeOnConfirm: true,
      labels: {
        confirm: 'Delete',
        cancel: 'Cancel',
      },
    });
  };

  const showEditListModal = (list: TaskList) => {
    openModal({
      title: list ? 'Edit list' : 'New list',
      centered: true,
      children: <TaskListEditForm list={list} onSubmit={updateList} />,
    });
  };

  return (
    <div className="mr-2 flex items-center gap-2">
      <Accordion.Control {...rest} />
      <Menu openDelay={100} closeDelay={400} withArrow position="right">
        <Menu.Target>
          <button className="rounded border border-transparent text-zinc-500 opacity-0 transition duration-300 group-hover:opacity-100 hover:border-blue-300/30 hover:bg-blue-500/30 hover:text-blue-300">
            <EllipsisHorizontalIcon className="w-6" />
          </button>
        </Menu.Target>

        <Menu.Dropdown className="font-semibold">
          <Menu.Item icon={<ArrowRightCircleIcon className="w-6" />} disabled>
            Move list
          </Menu.Item>
          <Menu.Item
            icon={<ArchiveBoxArrowDownIcon className="w-6" />}
            disabled
          >
            Archive list
          </Menu.Item>
          <Menu.Item
            icon={<Cog6ToothIcon className="w-6" />}
            onClick={() => showEditListModal(list)}
          >
            List settings
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            icon={<TrashIcon className="w-6" />}
            color="red"
            onClick={() => showDeleteListModal(list)}
          >
            Delete list
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
};

export default TaskListAccordionControl;